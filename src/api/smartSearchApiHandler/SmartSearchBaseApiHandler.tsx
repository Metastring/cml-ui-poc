import {
  SmartSearchPayload,
  SmartSearchResponse,
} from "@/types/api/smartSearch.types";

const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;

/**
 * Natural-language question answered as one SQL query over a registered dataset.
 * The backend runs an LLM per request, so this routinely takes 30-60s.
 */
export const postSmartSearch = async (
  payload: SmartSearchPayload,
  signal?: AbortSignal
): Promise<SmartSearchResponse> => {
  const res = await fetch(`${BASE_URL}/nl-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    let message = `Smart search failed: ${res.status}`;
    try {
      const json = (await res.json()) as { detail?: string };
      if (json?.detail) message = json.detail;
    } catch {
      // response had no JSON body; keep the status-based message
    }
    throw new Error(message);
  }

  return res.json();
};
