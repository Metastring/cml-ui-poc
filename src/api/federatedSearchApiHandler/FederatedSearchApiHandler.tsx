import { useQuery } from "@tanstack/react-query";
import { GetFederatedSearchBaseApiHandler } from "./FederatedSearchBaseApiHandler";
import { useFederatedSearchStore } from "@/store/useFederatedSearchStore";

export const useGetFederatedResultByQuery = () => {
  const { query } = useFederatedSearchStore();

  const shouldFetch = query.trim().length > 0;

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["federated-search-results", query],
    queryFn: () => GetFederatedSearchBaseApiHandler(`/xyz/${query}`),
    enabled: shouldFetch,
  });

  return { data, error, isLoading, isFetching, refetch };
};
