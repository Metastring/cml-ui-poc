
import { useQuery} from '@tanstack/react-query'
import { GetMapSearchBaseApiHandler } from './PolygonBaseApiHandler';


export const useGetWMSLayerByDataset = ({ dataset }: { dataset: string }) => {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["wms-layer-detail", dataset], // include dataset for caching
    queryFn: () => GetMapSearchBaseApiHandler(`/api/${dataset}`),
    enabled: false,
  });

  return { data, error, isLoading, isFetching, refetch };
};
