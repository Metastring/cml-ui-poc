"use client";

import useIndicatorStore from "@/store/map_indicatore_store/useIndicatorStore";
import SingleLayerRenderer from "@/components/mapFeatures/externalLayers/SingleLayerRenderer";

const ExternalLayers = () => {
  const { selectedSources } = useIndicatorStore();

  return (
    <>
      {Object.entries(selectedSources).flatMap(([indicatorId, sourceIds]) =>
        sourceIds.map((sourceId) => (
          <SingleLayerRenderer
            key={`${indicatorId}-${sourceId}`}
            indicatorId={indicatorId}
            sourceId={sourceId}

          />
        ))
      )}
    </>
  );
};

export default ExternalLayers;
