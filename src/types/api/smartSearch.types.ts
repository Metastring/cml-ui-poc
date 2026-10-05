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
