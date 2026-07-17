import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMapSearchBaseApiHandler } from "./MapSearchBaseApiHandler";
import { toast } from "sonner";
import {
  MapSearchParams,
  PolygonDataItem,
  MapSearchResult,
  MultiPolygonDisplayResults,
  FederatedMapSearchPayload,
  FederatedMapSearchResponse,
} from "@/types/api/mapSearch.types";

/** Normalize API response keys (e.g. scientificname, eventdate) to PolygonDataItem shape */
function normalizePolygonItem(raw: Record<string, unknown>, datasetKey: string): PolygonDataItem {
  const get = (camel: string, lower: string) =>
    (raw[camel] ?? raw[lower]) as string | number | undefined;
  const lat = (raw.latitude ?? raw.decimallatitude) as number | undefined;
  const lng = (raw.longitude ?? raw.decimallongitude) as number | undefined;
  return {
    scientificName: String(get("scientificName", "scientificname") ?? get("scientific_name", "scientific_name") ?? ""),
    scientific_name: raw.scientific_name as string | undefined,
    eventDate: String(raw.eventDate ?? raw.eventdate ?? ""),
    basisOfRecord: (raw.basisOfRecord ?? raw.basisofrecord) as string | undefined,
    longitude: Number(lng ?? 0),
    latitude: Number(lat ?? 0),
    dataset: datasetKey,
    region: raw.region as string | undefined,
    family: raw.family as string | undefined,
    genus: raw.genus as string | undefined,
    species: raw.species as string | undefined,
    author: raw.author as string | undefined,
    state: raw.state as string | undefined,
    continent: raw.continent as string | undefined,
    countryCode: (raw.countryCode ?? raw.countrycode) as string | undefined,
  };
}

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
  dataset,
  shapes = [],
  limit = 500,
  offset = 0,
}: MapSearchParams): Promise<MapSearchResult> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MAP_BASE_URL}/v1/spatial_search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetMultiPolygonDataWithDisplayFields($input: SpatialQueryInput!) {
            getMultiPolygonDataWithDisplayFields(input: $input) {
              results
            }
          }
        `,
        variables: {
          input: {
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
  const results: MultiPolygonDisplayResults =
    json.data?.getMultiPolygonDataWithDisplayFields?.results ?? {};

  const allDisplayFields = new Set<string>();
  const rows: PolygonDataItem[] = [];

  for (const [datasetKey, payload] of Object.entries(results)) {
    const displayFields = payload?.display_fields ?? [];
    const data = payload?.data ?? [];
    displayFields.forEach((f) => allDisplayFields.add(f));
    for (const item of data) {
      const normalized = normalizePolygonItem(
        (item ?? {}) as Record<string, unknown>,
        datasetKey
      );
      // Keep all raw keys for table display (so display_fields columns resolve)
      const row: PolygonDataItem = { ...normalized };
      for (const [k, v] of Object.entries(item ?? {})) {
        if (v !== undefined && row[k] === undefined) {
          row[k] = v as string | number;
        }
      }
      rows.push(row);
    }
  }

  return {
    rows,
    displayFields: Array.from(allDisplayFields),
  };
};

const EMPTY_MAP_SEARCH_RESULT: MapSearchResult = {
  rows: [],
  displayFields: [],
};

export const useGetMapSearchData = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<MapSearchResult, Error, MapSearchParams>({
    mutationFn: fetchPolygonData,
    onSuccess: (data) => {
      queryClient.setQueryData(["polygonData"], data);
      queryClient.setQueryDefaults(["polygonData"], {
        staleTime: 600_000,
        gcTime: 600_000,
      });

      if (!data?.rows?.length) {
        toast.error(
          "No data found for your search. Please try with another polygon."
        );
      }
    },
  });

  const clearDataMapSearchData = () => {
    queryClient.setQueryData(["polygonData"], EMPTY_MAP_SEARCH_RESULT);
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

const FEDERATED_MAP_SEARCH_URL = `${process.env.NEXT_PUBLIC_MAP_BASE_URL}/v2/spatial_search`;

export const useMutateFederatedMapSearch = () => {
  const mutation = useMutation<
    FederatedMapSearchResponse,
    Error,
    FederatedMapSearchPayload
  >({
    mutationFn: async (payload) => {
      const res = await fetch(FEDERATED_MAP_SEARCH_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      return res.json();
    },
    onError: (error) => {
      toast.error(`Federated map search failed: ${error.message}`);
    },
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
  };
};
