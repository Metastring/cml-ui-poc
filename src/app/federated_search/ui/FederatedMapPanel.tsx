"use client";

import React from "react";
import { Map as MapIcon } from "lucide-react";
import MapListIndex from "@metastringfoundation/map-list";

interface FederatedMapPanelProps {
  datasetName?: string;
  resultCount?: number;
}

export function FederatedMapPanel({
  datasetName = "Dataset",
  resultCount = 0,
}: FederatedMapPanelProps) {
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
        selectedLayers={[
          // { name: "gbif", style: "gbif_eventdate_style" },
          {name: "cpmp", style: "cpmp_species_style"}
        ]}
      />
    </div>
  );
}
