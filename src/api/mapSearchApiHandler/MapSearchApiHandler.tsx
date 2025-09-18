import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMapSearchBaseApiHandler } from "./MapSearchBaseApiHandler";
import { toast } from "sonner";
import { MapSearchParams, PolygonDataItem } from "@/types/api/mapSearch.types";

export const useGetWMSLayerByDataset = ({
  dataset,
}: {
  dataset?: string[];
}) => {
  const { data: rawData } = useQuery({
    queryKey: ["wms-layer-detail", dataset],
    queryFn: () =>
      GetMapSearchBaseApiHandler("/layers/tile_urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataset ?? []),
      }),
    enabled: !!dataset && dataset.length > 0,
  });

  const data = rawData
    ? Object.entries(rawData).map(([key, value], index) => ({
        id: `${index + 1}`, // convert to string
        name: key,
        wmsUrl: value as string, // lowercase 'u'
      }))
    : [];

  console.log("Transformed data:", data);

  return { data };
};


const fetchPolygonData = async ({
  category,
  dataset,
  shapes,
  limit = 500,
  offset = 0,
}: MapSearchParams): Promise<PolygonDataItem[]> => {
  console.log(dataset);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MAP_BASE_URL}/v1/graphql_data_method`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($input: SpatialQueryInput!) {
  getMultiPolygonData(input: $input) {
    results
  }
}
        `,
        variables: {
          input: {
            category,
            dataset,
            polygonDetail: shapes,
            limit,
            offset,
          },
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }
  const json = await res.json();
  // console.log("✅ API JSON:", json);

  const multiPolygonData: Record<string, PolygonDataItem[]> =
    json.data?.getMultiPolygonData?.results || {};

  const results = Object.entries(multiPolygonData).flatMap(([key, items]) =>
    (items || []).map((item) => ({
      ...item,
      dataset: key,
    }))
  );

  // console.log("✅ Results prepared:", results);

  return results ?? [];
};

export const useGetMapSearchData = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<PolygonDataItem[], Error, MapSearchParams>({
    mutationFn: fetchPolygonData,
    onSuccess: (data) => {
      // ✅ Cache the result under 'polygonData' key
      queryClient.setQueryData(["polygonData"], data);

      // ✅ Set the query options so it stays in cache for 10 minutes (600_000 ms)
      queryClient.setQueryDefaults(["polygonData"], {
        staleTime: 600_000,
        gcTime: 600_000,
      });

      if (!data || data.length === 0) {
        toast.error(
          "No data found for your search. Please try with another polygon."
        );

        // alert("No data found for your search. Please try with another polygon.");
      }
    },
  });

  const clearDataMapSearchData = () => {
    queryClient.setQueryData(["polygonData"], []);
  };

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    clearDataMapSearchData,
  };
};
