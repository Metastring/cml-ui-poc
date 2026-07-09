"use client";

import React from "react";
import { Database, Loader2 } from "lucide-react";
import { DatasetOverviewRow } from "@/app/federated_search/components/FederatedSearchOverview";
import FederatedDataTable from "@/app/federated_search/components/FederatedDataTable";
import { DataItem } from "@/types/api/federatedSearch.types";

interface DetailPanelProps {
  selectedDataset: DatasetOverviewRow | null;
  flattenedData: DataItem[];
  fieldColumns: string[];
  isToggleActive: boolean;
  mapModeDatasetKey?: string | null;
  isLoading?: boolean;
}

export function DetailPanel({
  selectedDataset,
  flattenedData,
  fieldColumns,
  isToggleActive,
  mapModeDatasetKey,
  isLoading = false,
}: DetailPanelProps) {
  if (!isToggleActive || !selectedDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center bg-card/50">
        <Database className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm font-medium">Details Panel</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Select a dataset to see results</p>
      </div>
    );
  }

  const displayData = flattenedData.filter((item) => item.dataset === selectedDataset.datasetKey);
  const isMapMode = mapModeDatasetKey === selectedDataset.datasetKey;

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3 bg-card/80 backdrop-blur">
        <h3 className="text-sm font-semibold text-foreground">{selectedDataset.datasetName}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isMapMode ? "Map View" : `${displayData.length.toLocaleString()} ${displayData.length === 1 ? "record" : "records"}`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading data…</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Fetching dataset information</p>
          </div>
        ) : isMapMode ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <div className="text-3xl mb-3">🗺️</div>
            <p className="text-sm font-medium">Map Panel</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Map component will be integrated here</p>
          </div>
        ) : (
          <FederatedDataTable
            data={displayData}
            fieldColumns={fieldColumns}
            isLoading={false}
            isError={false}
            embedded={true}
          />
        )}
      </div>
    </div>
  );
}
