// hooks/usePolygonData.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  GetPolygonBaseApiHandler,
  PostPolygonBaseApiHandler,
} from '@/api/polygonApiHandler/PolygonBaseApiHandler'


export const useFetchPolygons = () => {
  const { data, error, isLoading, isFetching, refetch} = useQuery({
    queryKey: ['polygon-data'],
    queryFn: () => GetPolygonBaseApiHandler('/api/polygons'),
    enabled: true, // set false to run when refetch is called
  })

  return { data, error, isLoading, isFetching, refetch}
}

export const usePostPolygon = () => {
  const queryClient = useQueryClient()

  const {
    mutate,
    data,
    error,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: (geojson: unknown) =>
      PostPolygonBaseApiHandler('/api/polygons', geojson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polygon-data'] })
    },
  })

  return {
    postGeojson: mutate,
    postResponse: data,
    postError: error,
    postLoading: isPending,
    isSuccess,
    isError,
  }
}