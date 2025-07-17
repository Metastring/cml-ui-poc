import { useQuery } from "@tanstack/react-query";
import { GetFederatedSearchBaseApiHandler } from "./FederatedSearchBaseApiHandler";
import { useFederatedSearchStore } from "@/store/useFederatedSearchStore";

export const useGetFederatedResultByQuery = () => {
  const { query, categories } = useFederatedSearchStore();

  // console.log(categories[0])
  // console.log(query)

  const shouldFetch = query.trim().length > 0 && categories.length > 0;

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["federated-search-results", query, categories[0]],
    queryFn: () => {
      return GetFederatedSearchBaseApiHandler(
        `/federated-search?category=species&field=${categories[0]}&query=${query}`
      );
    },
    enabled: shouldFetch,
  });

  const dataSets: { name: string; count: number }[] = data?.results
    ? Object.entries(data.results).map(([key, value]) => ({
        name: key,
        count: (value as { results?: unknown[] })?.results?.length || 0,
      }))
    : [];

  return { data, dataSets, error, isLoading, isFetching, refetch };
};
