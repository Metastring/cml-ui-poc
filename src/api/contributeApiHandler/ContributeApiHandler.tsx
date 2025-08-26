import { useMutation } from "@tanstack/react-query";
import { PostContributeBaseApiHandler } from "./ContributeBaseApiHandler";

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
interface MutationPayload {
  endpoint: string;
  params: object;
}

export const useRegisterYourDataset = () => {
  const initialDatasetMutation = useMutation<InitialDatasetResponse, Error, MutationPayload>({
    mutationFn: ({ endpoint, params }) => PostContributeBaseApiHandler(endpoint, params),
  });

  const finalDatasetMutation = useMutation<FinalDatasetResponse, Error, MutationPayload>({
    mutationFn: ({ endpoint, params }) => PostContributeBaseApiHandler(endpoint, params),
  });

  return { initialDatasetMutation, finalDatasetMutation };
};
