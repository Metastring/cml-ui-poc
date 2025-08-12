'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

interface PolygonDetail {
  geometry: PolygonGeometry;
}

export interface SearchParams {
  dataset: string[];
  shapes: PolygonDetail[];
  limit?: number;
  offset?: number;
}

export type PolygonDataItem = Record<string, unknown>;

const fetchPolygonData = async ({
  dataset,
  shapes,
  limit = 100,
  offset = 0,
}: SearchParams): Promise<PolygonDataItem[]> => {
  console.log(dataset);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MAP_BASE_URL}/v1/graphql_data_method`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetPolygonData($input: SpatialQueryInput!) {
            getPolygonData(input: $input) {
              data
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
  return json.data?.getPolygonData?.data || [];
};

export const useGetMapSearchData = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<PolygonDataItem[], Error, SearchParams>({
    mutationFn: fetchPolygonData,
    onSuccess: (data) => {
      // ✅ Cache the result under 'polygonData' key
      queryClient.setQueryData(['polygonData'], data);

      // ✅ Set the query options so it stays in cache for 10 minutes (600_000 ms)
      queryClient.setQueryDefaults(['polygonData'], {
        staleTime: 600_000, 
        gcTime: 600_000,
      });

       if (!data || data.length === 0) {
        toast.error("No data found for your search. Please try with another polygon.");

        // alert("No data found for your search. Please try with another polygon.");
      }
    },
  });

   const clearDataMapSearchData = () => {
    queryClient.setQueryData(['polygonData'], []);
  };

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    clearDataMapSearchData
  };
};
