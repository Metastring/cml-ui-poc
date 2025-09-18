//contribute.types.ts
// ----------------- Payload Types -----------------
export interface InitialDatasetForm {
  name: string;
  description: string;
  category: string;
  [key: string]: string; // optional extra string fields
}

export interface FinalDatasetForm {
  columns: string[];
  records: number;
  dataset_id: string;
  [key: string]: string | string[] | number;
}

// API response for initial dataset submission
export interface InitialDatasetResponse {
  dataset_id: string;
}

// API response for final dataset submission
export interface FinalDatasetResponse {
  success: boolean;
  message?: string;
}

// ----------------- Hook -----------------
export interface MutationPayload {
  endpoint: string;
  params: object;
}