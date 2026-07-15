"use client";

import React from "react";
import MapListIndex from "@metastringfoundation/map-list";
import { MatchedFieldsMap } from "@/types/api/federatedSearch.types";

interface MapSectionProps {
  datasetGeoserverName?: string;
  mapFields?: MatchedFieldsMap[];
  isVisible: boolean;
}

export function MapSection({
  datasetGeoserverName,
  mapFields,
  isVisible,
}: MapSectionProps) {
  const selectedLayers = React.useMemo(() => {
    if (!mapFields || mapFields.length === 0) {
      return [];
    }
    return mapFields.map((field) => ({
      name: datasetGeoserverName!,
      style: field.styleName!,
    }));
  }, [mapFields, datasetGeoserverName]);

  if (!isVisible) return null;

  return (
    <div className="flex-1 min-h-0 w-full border-b border-gray-200 dark:border-gray-700 [&>div:not(.absolute)]:h-full [&_.h-screen]:!h-full">
      <MapListIndex
        loadToC={true}
        showToC={true}
        managePublishing={true}
        nakshaApiEndpoint={process.env.NEXT_PUBLIC_NAKSHA_ENDPOINT}
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
