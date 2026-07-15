"use client";

import React from "react";
import MapListIndex from "@metastringfoundation/map-list";
import { MatchedFieldsMap } from "@/types/api/federatedSearch.types";

interface FederatedMapPanelProps {
  datasetGeoserverName?: string;
  mapFields?: MatchedFieldsMap[];
}

export function FederatedMapPanel({
  datasetGeoserverName,
  mapFields,
}: FederatedMapPanelProps = {}) {
  const selectedLayers = React.useMemo(() => {
    if (!mapFields || mapFields.length === 0) {
      return [];
    }
    return mapFields.map((field) => ({
      name: datasetGeoserverName!,
      style: field.styleName!,
    }));
  }, [mapFields, datasetGeoserverName]);

  return (
    <div className="h-full w-full relative">
      <MapListIndex
        loadToC={true}
        showToC={true}
        managePublishing={true}
        nakshaApiEndpoint={process.env.NEXT_PUBLIC_NAKSHA_ENDPOINT}
        // nakshaEndpointToken={process.env.NEXT_PUBLIC_NAKSHA_TOKEN}
        geoserver={{
          endpoint: process.env.NEXT_PUBLIC_GEOSERVER_ENDPOINT!,
          store: process.env.NEXT_PUBLIC_GEOSERVER_STORE!,
          workspace: process.env.NEXT_PUBLIC_GEOSERVER_WORKSPACE!,
        }}
        onLayerDownload={console.log}
        canLayerShare={true}
        showLayerControls={false}
        selectedLayers={selectedLayers}
      />
      
    </div>
  );
}
