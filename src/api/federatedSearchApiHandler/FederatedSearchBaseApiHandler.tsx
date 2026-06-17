import {
  PreFederatedSearchData,
  PreFederatedSearchDataset,
  PreFederatedSearchDoneData,
  PreFederatedSearchPayload,
} from "@/types/api/federatedSearch.types";

const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;

export const GetFederatedSearchByPayload = (url: string, payload: unknown) =>
  fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((res) => res.json());

export const GetFederatedSearchBaseApiHandler = (url: string) =>
  fetch(`${BASE_URL}${url}`).then((res) => res.json());

type PreFederatedSearchStreamCallbacks = {
  onDataset?: (dataset: PreFederatedSearchDataset) => void;
  onDone?: (done: PreFederatedSearchDoneData) => void;
};

function isDatasetChunk(
  data: Record<string, unknown>
): data is Omit<PreFederatedSearchDataset, "display_name"> {
  return typeof data.dataset_name === "string";
}

function isDoneChunk(
  data: Record<string, unknown>
): data is PreFederatedSearchDoneData {
  return typeof data.search_text === "string" && "total" in data;
}

function toDataset(
  chunk: Omit<PreFederatedSearchDataset, "display_name">
): PreFederatedSearchDataset {
  return {
    dataset_name: chunk.dataset_name,
    display_name: chunk.dataset_name,
    available: chunk.available,
    count: chunk.count,
    matched_fields: chunk.matched_fields ?? [],
    is_occurance_available: chunk.is_occurance_available ?? false,
  };
}

function upsertDataset(
  datasets: PreFederatedSearchDataset[],
  dataset: PreFederatedSearchDataset
): PreFederatedSearchDataset[] {
  const index = datasets.findIndex(
    (item) => item.dataset_name === dataset.dataset_name
  );
  if (index < 0) return [...datasets, dataset];
  const next = [...datasets];
  next[index] = dataset;
  return next;
}

export async function streamPreFederatedSearch(
  payload: PreFederatedSearchPayload,
  callbacks: PreFederatedSearchStreamCallbacks = {}
): Promise<PreFederatedSearchData> {
  const res = await fetch(`${BASE_URL}/pre-federated-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await res.json()) as { detail?: string };
      throw new Error(json.detail ?? `Pre-federated search failed: ${res.status}`);
    }
    throw new Error(`Pre-federated search failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await res.json()) as { detail?: string };
    throw new Error(json.detail ?? "Pre-federated search failed");
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Pre-federated search returned no response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";
  let datasets: PreFederatedSearchDataset[] = [];
  let streamMeta: PreFederatedSearchDoneData | undefined;

  const handleDataLine = (jsonStr: string) => {
    if (!jsonStr) return;

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    if (currentEvent === "done" || isDoneChunk(parsed)) {
      streamMeta = {
        search_text: String(parsed.search_text),
        total: Number(parsed.total),
        cached: Boolean(parsed.cached),
      };
      callbacks.onDone?.(streamMeta);
      currentEvent = "message";
      return;
    }

    if (isDatasetChunk(parsed)) {
      const dataset = toDataset(parsed);
      datasets = upsertDataset(datasets, dataset);
      callbacks.onDataset?.(dataset);
    }

    currentEvent = "message";
  };

  while (true) {
    const { done: streamEnded, value } = await reader.read();
    if (streamEnded) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        currentEvent = "message";
        continue;
      }
      if (line.startsWith("event:")) {
        currentEvent = line.slice(6).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        handleDataLine(line.slice(5).trim());
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing.startsWith("data:")) {
    handleDataLine(trailing.slice(5).trim());
  }

  return {
    search_text: streamMeta?.search_text ?? payload.search_text,
    datasets,
    total: streamMeta?.total,
    cached: streamMeta?.cached,
    isComplete: true,
    isStreaming: false,
  };
}
