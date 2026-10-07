export interface SmartSearchDataset {
  dataset_id: number;
  title: string;
  table: string;
  citation: string;
  match_score: number;
}

export type SmartSearchCell = string | number | boolean | null;

export interface SmartSearchResponse {
  question: string;
  answered: boolean;
  interpretation: string;
  dataset: SmartSearchDataset | null;
  sql: string;
  columns: string[];
  rows: SmartSearchCell[][];
  row_count: number;
  truncated: boolean;
  failed_attempts: unknown[];
  other_candidates: SmartSearchDataset[];
  timings: Record<string, number>;
}

export interface SmartSearchPayload {
  question: string;
  dataset_id?: number | null;
}

/* ---- Deep search: POST /ask, a tool-using agent over several datasets ---- */

export interface AskPayload {
  question: string;
}

export interface AskCitation {
  dataset_id: number | null;
  title: string;
  fields?: string[];
  row_count?: number;
  citation?: string | null;
  sql?: string;
}

export interface AskStatusEvent {
  type: "status";
  message: string;
}

/** The agent's thought and the tool it decided to call. */
export interface AskStepEvent {
  type: "step";
  step: number;
  thought: string;
  action: string;
  action_input: Record<string, unknown>;
}

/** A tool's result. `data` is the tool's raw reply; for `query_data` it is a SmartSearchResponse. */
export interface AskObservationEvent {
  type: "observation";
  step: number;
  action: string;
  observation: string;
  ok: boolean;
  data: Record<string, unknown>;
}

export interface AskAnswerEvent {
  type: "answer";
  answer: string;
  citations: AskCitation[];
  steps: number;
  timings: Record<string, number>;
}

export interface AskErrorEvent {
  type: "error";
  message: string;
}

export type AskEvent =
  | AskStatusEvent
  | AskStepEvent
  | AskObservationEvent
  | AskAnswerEvent
  | AskErrorEvent;
