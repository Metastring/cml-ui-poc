import { useQuery } from "@tanstack/react-query";
import { GetMapSearchBaseApiHandler } from "./PolygonBaseApiHandler";

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
