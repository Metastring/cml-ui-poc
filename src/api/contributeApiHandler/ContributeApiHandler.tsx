import { useMutation, useQuery } from "@tanstack/react-query";
import {
  PostContributeBaseApiHandler,
  PostDatasetRegistryWithFile,
} from "./ContributeBaseApiHandler";
import { GetFederatedSearchBaseApiHandler } from "../federatedSearchApiHandler/FederatedSearchBaseApiHandler";
import {
  FinalDatasetResponse,
  InitialDatasetResponse,
  MutationPayload,
} from "@/types/api/contribute.types";

export interface RegisterDatasetByFilePayload {
  file: File;
  dataset_description: string;
}

export const useRegisterYourDataset = () => {
  const initialDatasetMutation = useMutation<
    InitialDatasetResponse,
    Error,
    MutationPayload
  >({
    mutationFn: ({ endpoint, params }) =>
      PostContributeBaseApiHandler(endpoint, params),
  });

  const uploadFileMutation = useMutation<
    InitialDatasetResponse,
    Error,
    RegisterDatasetByFilePayload
  >({
    mutationFn: ({ file, dataset_description }) =>
      PostDatasetRegistryWithFile(file, dataset_description),
  });

  const finalDatasetMutation = useMutation<
    FinalDatasetResponse,
    Error,
    MutationPayload
  >({
    mutationFn: ({ endpoint, params }) =>
      PostContributeBaseApiHandler(endpoint, params),
  });

  return {
    initialDatasetMutation,
    uploadFileMutation,
    finalDatasetMutation,
  };
};

export const useGetCategoriesList = () => {
  const { data, error, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => GetFederatedSearchBaseApiHandler(`/categories`),
    staleTime: 1000 * 6000,
    enabled: true,
  });
  return { data, error, isLoading, isFetching, refetch, isError };
};

export const useGetOntologyList = () => {
  const { data, error, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["/ontology-list"],
    queryFn: () => GetFederatedSearchBaseApiHandler(`/ontology-list`),
    staleTime: 1000 * 6000,
    enabled: true,
  });

  const ontologyData: string[] = data?.ontology_list ?? [];
  return { data: ontologyData, error, isLoading, isFetching, refetch, isError };
};
