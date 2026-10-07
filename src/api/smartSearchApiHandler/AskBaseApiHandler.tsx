import { AskEvent, AskPayload } from "@/types/api/smartSearch.types";

const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;

/**
 * Natural-language question answered by a tool-using agent that can look across
 * several datasets (and peer nodes). The backend streams server-sent events, one
 * per agent step; a question routinely takes 1-3 minutes.
 *
 * EventSource only does GET, so the stream is read off a POST fetch by hand.
 */
export const streamAsk = async (
  payload: AskPayload,
  onEvent: (event: AskEvent) => void,
  signal?: AbortSignal
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ ...payload, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    let message = `Deep search failed: ${res.status}`;
    try {
      const json = (await res.json()) as { detail?: unknown };
      if (typeof json?.detail === "string") message = json.detail;
    } catch {
      // response had no JSON body; keep the status-based message
    }
    throw new Error(message);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    // Events are separated by a blank line; keep any partial event for the next chunk.
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const event = parseSseEvent(part);
      if (event) onEvent(event);
    }
  }
  const last = parseSseEvent(buffer);
  if (last) onEvent(last);
};

const parseSseEvent = (block: string): AskEvent | null => {
  const data = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
  if (!data) return null;
  try {
    return JSON.parse(data) as AskEvent;
  } catch {
    return null;
  }
};
