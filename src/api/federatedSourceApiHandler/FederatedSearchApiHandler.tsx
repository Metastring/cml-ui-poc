import { useQuery } from "@tanstack/react-query";
import { GetFederatedSourceBaseApiHandler } from "./FederatedSourceBaseApiHandler";

export const useGetFederatedSourceData = () => {
  const { data, error, isLoading, isFetching, refetch , isError } = useQuery({
    queryKey: ["metadata"],
    queryFn: () =>
      GetFederatedSourceBaseApiHandler(`/federated-sources`),
    staleTime: 1000 * 6000,
    enabled: true,
  });
  return { data, error, isLoading, isFetching, refetch , isError };
};