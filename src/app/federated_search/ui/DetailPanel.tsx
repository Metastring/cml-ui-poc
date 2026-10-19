"use client";

import React from "react";
import { Database, Loader2 } from "lucide-react";
import { DatasetOverviewRow } from "@/app/federated_search/components/FederatedSearchOverview";
import FederatedDataTable from "@/app/federated_search/components/FederatedDataTable";
import { FederatedMapPanel } from "@/app/federated_search/map/FederatedMapPanel";
import { DataItem } from "@/types/api/federatedSearch.types";
import { Typography } from "@/components/ui/typography";

interface DetailPanelProps {
  selectedDataset: DatasetOverviewRow | null;
  flattenedData: DataItem[];
  fieldColumns: string[];
  isToggleActive: boolean;
  mapModeDatasetKey?: string | null;
  isLoading?: boolean;
  searchText?: string;
  categories?: string[];
}

export function DetailPanel({
  selectedDataset,
  flattenedData,
  fieldColumns,
  isToggleActive,
  mapModeDatasetKey,
  isLoading = false,
  searchText = "",
  categories = [],
}: DetailPanelProps) {
  if (!isToggleActive || !selectedDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center bg-card/50">
        <Database className="h-12 w-12 mb-3 opacity-40" />
        <Typography variant="body" weight="medium">Details Panel</Typography>
        <Typography variant="small" className="text-muted-foreground/70 mt-1">Select a dataset to see results</Typography>
      </div>
    );
  }

  const displayData = flattenedData.filter((item) => item.dataset === selectedDataset.datasetKey);
  const isMapMode = mapModeDatasetKey === selectedDataset.datasetKey;

  return (
    <div className="flex flex-col h-full w-full bg-card overflow-hidden">
      {/* Header */}
      {!isMapMode && (
        <div className="shrink-0 border-b border-border px-4 py-3 bg-card/80 backdrop-blur">
          <Typography variant="h4" as="h3" tone="default">{selectedDataset.datasetName}</Typography>
          <Typography variant="small" tone="muted" className="mt-1">
            {`${displayData.length.toLocaleString()} ${displayData.length === 1 ? "record" : "records"}`}
          </Typography>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <Typography variant="body" weight="medium">Loading data…</Typography>
            <Typography variant="small" className="text-muted-foreground/70 mt-1">Fetching dataset information</Typography>
          </div>
        ) : isMapMode ? (
          <FederatedMapPanel
            datasetGeoserverName={selectedDataset?.dataset_geoserver_name}
            mapFields={selectedDataset?.mapFields}
            searchPayload={{
              search_text: searchText,
              category: selectedDataset.category
                ? [selectedDataset.category]
                : categories,
              dataset: [selectedDataset.datasetKey],
              fields: (selectedDataset.mapFields ?? []).map((f) => f.field),
            }}
            tableTitle={selectedDataset?.datasetName}
          />
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
