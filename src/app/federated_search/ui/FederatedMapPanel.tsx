"use client";

import React from "react";
import { Map as MapIcon } from "lucide-react";

interface FederatedMapPanelProps {
  datasetName?: string;
  resultCount?: number;
}

export function FederatedMapPanel({
  datasetName = "Dataset",
  resultCount = 0,
}: FederatedMapPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center bg-card/50">
      <MapIcon className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-sm font-medium">Map Visualization</p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Map component for {resultCount} records from {datasetName}
      
      </p>
    </div>
  );
}
