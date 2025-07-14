"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostLayerBaseApiHandler } from "@/api/layerApiHandler/LayerBaseApiHandler";
import { fetchIndicatorData } from "./FetchIndicatorData";

const HHM_BASE_URL = process.env.NEXT_PUBLIC_HHM_BASE_URL;

export const useFetchHHMLayers = () => {
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["Layer-data"],
    queryFn: async () => {
      const res = await fetch(HHM_BASE_URL + "/dimensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [
            "indicator.id",
            "indicator.Category",
            "indicator.Sub-Category",
            "indicator.Positive/Negative",
            "source.id",
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }

      const dimensionsData = await res.json();
      return dimensionsData;
    },
    enabled: true,
    staleTime: 300000,
  });

  return { data, error, isLoading, isFetching, refetch };
};

export const usePostLayer = () => {
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess, isError } = useMutation({
    mutationFn: (geojson: unknown) =>
      PostLayerBaseApiHandler("/api/Layers", geojson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Layer-data"] });
    },
  });

  return {
    postGeojson: mutate,
    postResponse: data,
    postError: error,
    postLoading: isPending,
    isSuccess,
    isError,
  };
};

export const useIndicatorData = ({
  indicatorId,
  sourceId,
}: {
  indicatorId?: string;
  sourceId?: string;
}) => {
  console.log("ind", indicatorId);
  return useQuery({
    queryKey: ["indicator-data", indicatorId, sourceId],
    queryFn: () =>
      fetchIndicatorData({
        indicatorId: indicatorId!,
        sourceId: sourceId!,
      }),
    enabled: !!indicatorId && !!sourceId, // Only run when both values exist
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
