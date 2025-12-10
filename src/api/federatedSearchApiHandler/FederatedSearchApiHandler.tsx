import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetFederatedSearchBaseApiHandler,
  GetFederatedSearchByPayload,
} from "./FederatedSearchBaseApiHandler";
import { toast } from "sonner";
import { Category, DataItem, DatasetDetail, FederatedSearchData, MapDataItem } from "@/types/api/federatedSearch.types";


export const useMutateFederatedSearch = () => {
  const queryClient = useQueryClient();

  const queryKey = ["federatedSearchResult"];

  const queryResult = useQuery<FederatedSearchData>({
    queryKey,
    queryFn: () => {
      const cachedData =
        queryClient.getQueryData<FederatedSearchData>(queryKey);
      return Promise.resolve(cachedData ?? {});
    },
    enabled: true,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: ({
      search_text,
      category,
      dataset,
      fields,
    }: {
      search_text: string;
      category: string[];
      dataset: string[];
      fields: string[];
    }) =>
      GetFederatedSearchByPayload("/federated-search", {
        search_text,
        category,
        dataset,
        fields,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    ...queryResult,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isMutating: mutation.isPending,
  };
};

export const useGetFilterData = () => {
  const { data, error, isLoading, isFetching, refetch , isError } = useQuery<Category[]>({
    queryKey: ["metadata"],
    queryFn: () =>
      GetFederatedSearchBaseApiHandler(`/categories-with-datasets`),
    staleTime: 1000 * 6000,
    enabled: true,
  });
  return { data, error, isLoading, isFetching, refetch , isError };
};

export const useGetIndicatorsByCategoryAndDatasets = (
  category: string,
  datasets: string[]
) => {
  const query = new URLSearchParams({
    category,
    datasets: datasets.join(","),
  });

  return useQuery<unknown[]>({
    queryKey: ["metadata", category, datasets],
    queryFn: () =>
      GetFederatedSearchBaseApiHandler(`/api/indicators?${query.toString()}`),
    enabled: !!category && datasets.length > 0,
  });
};

export const useGetDatasetDetails = (
  categoryName: string,
  datasetTitle: string
) => {
  return useQuery<DatasetDetail>({
    queryKey: ["dataset-details", categoryName, datasetTitle],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FEDERATED_BASE_URL}/metadata?title=${datasetTitle}&category_name=${categoryName}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch dataset details");
      }
      return res.json();
    },
    enabled: Boolean(categoryName && datasetTitle),
  });
};



export const useGetMapDataBasedOnFederatedSearchResult = () => {
  return useMutation<MapDataItem[], Error, string>({
    mutationFn: async (scientificName: string) => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_MAP_BASE_URL + "/v1/spatial_search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query ($input: ScientificNameInput!) {
                getScientificNameMatches(input: $input) {
                  results
                }
              }
            `,
            variables: { input: { scientificName } },
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch dataset details for ${scientificName}`
        );
      }

      const json = await res.json();
      const mapdata: Record<string, DataItem[]> =
        json.data?.getScientificNameMatches?.results || {};
        console.log(mapdata)

      const results: MapDataItem[] = Object.entries(mapdata).flatMap(
        ([key, items]) =>
          (items || [])
            .filter(
              (item) => item.decimalLatitude && item.decimalLongitude
            )
            .map((item) => ({
              latitude: item.decimalLatitude as number,
              longitude: item.decimalLongitude as number,
              scientificName:
                item.scientificName || item.taxon_name || "Unknown",
              dataset: key,
              basisOfRecord:item.basisOfRecord as string,
              eventDate:item.eventDate as string,

            }))
      );

      return results;
    },

    onSuccess: (data, scientificName) => {
      console.log("map data", data);
      if (!data || data.length === 0) {
        toast.error(`No occurrence data available for "${scientificName}"`);
      }
    },

    onError: (error, scientificName) => {
      toast.error(
        `Error fetching data for "${scientificName}": ${error.message}`
      );
    },
  });
};
