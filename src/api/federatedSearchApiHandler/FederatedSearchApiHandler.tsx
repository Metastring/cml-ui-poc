import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetFederatedSearchBaseApiHandler,
  GetFederatedSearchByPayload,
} from "./FederatedSearchBaseApiHandler";

export const useFederatedSearchResult = (
  search_text: string,
  category: string[],
  dataset: string[]
) => {
  const queryClient = useQueryClient();

  const queryKey = ["federatedSearchResult"];

  if (search_text && search_text.trim().length > 0) {
    queryKey.push(search_text.trim());
  }

  if (Array.isArray(category) && category.length > 0) {
    queryKey.push(...category);
  }

  if (Array.isArray(dataset) && dataset.length > 0) {
    queryKey.push(...dataset);
  }

  const queryResult = useQuery({
    queryKey,
    queryFn: () => {
      const cachedData = queryClient.getQueryData(queryKey);
      return Promise.resolve(cachedData ?? []);
    },
    enabled: true,
    staleTime: Infinity,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  };
};


export const useFederatedSearchMutate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      search_text,
      category,
      dataset,
    }: {
      search_text: string;
      category: string[];
      dataset: string[];
    }) =>
      GetFederatedSearchByPayload("/federated-search", {
        search_text,
        category,
        dataset,
      }),
    onSuccess: (data, variables) => {
      const { search_text, category, dataset } = variables;
      const queryKey = [
        "federatedSearchResult",
        search_text,
        ...category,
        ...dataset,
      ];
      queryClient.setQueryData(queryKey, data);
    },
  });
};

export const useGetFilterData = () => {
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["metadata"],
    queryFn: () => GetFederatedSearchBaseApiHandler(`/metadata`),
    enabled: true,
  });
  return { data, error, isLoading, isFetching, refetch };
};
