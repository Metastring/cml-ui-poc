// src/api/indicators/fetchIndicatorData.ts

const HHM_BASE_URL = process.env.NEXT_PUBLIC_HHM_BASE_URL
// console.log(HHM_BASE_URL)
export const fetchIndicatorData = async ({
  indicatorId,
  sourceId,
}: {
  indicatorId: string;
  sourceId: string;
}) => {
  const payload = {
    terms: {
      "indicator.id": [indicatorId],
      "source.id": [sourceId],
    },
  };

  const response = await fetch(HHM_BASE_URL+"/data/autoFiltered", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Failed to fetch indicator data");

  const data = await response.json();
  return data.data || [];
};
