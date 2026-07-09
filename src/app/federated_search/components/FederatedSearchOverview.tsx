"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MapPin,
  Check,
  Map as MapIcon,
} from "lucide-react";
import {
  useGetFilterData,
  useMutatePreFederatedSearch,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function extractFieldNames(matchedFields: {
  tabular: string[];
  map: Array<{ field: string }>;
}): string[] {
  return matchedFields.tabular;
}

export type DatasetOverviewRow = {
  datasetKey: string;
  datasetName: string;
  resultCount: number;
  matchedFields: string[];
  matchedIndicatorLabels: string[];
  hasOccurrence: boolean;
};

type DatasetCardProps = {
  item: DatasetOverviewRow;
  index: number;
  isSelected: boolean;
  onSelect: (item: DatasetOverviewRow) => void;
  onCloseSearch?: () => void;
  onExploreMap?: (datasetKey: string) => void;
  isMapMode?: boolean;
};

function DatasetCard({
  item,
  index,
  isSelected,
  onSelect,
  onCloseSearch,
  onExploreMap,
  isMapMode,
}: DatasetCardProps) {
  const handleClick = () => {
    onSelect(item);
    onCloseSearch?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className={cn(
        "relative p-4 rounded-lg border-2 transition-all text-left duration-200 flex flex-col justify-between cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        isSelected
          ? "border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-card shadow-lg shadow-primary/15 ring-2 ring-primary/30 hover:shadow-xl hover:shadow-primary/20"
          : "border-border/40 bg-card hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold transition-all",
            isSelected
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 ring-2 ring-primary/20 scale-110"
              : "bg-muted text-muted-foreground"
          )}
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3
              className={cn(
                "text-sm font-semibold line-clamp-1",
                isSelected ? "text-primary font-bold" : "text-foreground"
              )}
              title={item.datasetName}
            >
              {item.datasetName}
            </h3>
            {item.hasOccurrence && (
              <Badge
                variant="outline"
                className="h-4 gap-0.5 px-1 text-[9px] border-primary/25 text-primary bg-primary/5"
              >
                <MapPin className="h-2 w-2" />
                Map
              </Badge>
            )}
          </div>

            {item.matchedIndicatorLabels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.matchedIndicatorLabels.slice(0, 3).map((label) => (
                  <span
                    key={label}
                    className={cn(
                      "text-[9px] rounded px-1.5 py-0.5 truncate",
                      isSelected
                        ? "bg-primary/20 text-primary font-medium"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                    title={label}
                  >
                    {label}
                  </span>
                ))}
                {item.matchedIndicatorLabels.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{item.matchedIndicatorLabels.length - 3} more
                  </span>
                )}
              </div>
            )}

          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "inline-block rounded px-2 py-1 text-xs font-semibold",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-foreground"
              )}
            >
              {item.resultCount.toLocaleString()} results
            </span>
            {item.hasOccurrence && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreMap?.(item.datasetKey);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition-colors border",
                  isMapMode
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "border-primary/25 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/40"
                )}
              >
                <MapIcon className="h-3 w-3" />
                Explore on Map
              </button>
            )}
          </div>
        </div>
        {isSelected && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/40 ring-2 ring-primary/20 animate-in zoom-in-50 duration-300">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

    </div>
  );
}

function DatasetGrid({
  items,
  selectedDataset,
  onSelectDataset,
  onCloseSearch,
  onExploreMap,
  mapModeDatasetKey,
}: {
  items: DatasetOverviewRow[];
  selectedDataset: DatasetOverviewRow | null;
  onSelectDataset: (item: DatasetOverviewRow) => void;
  onCloseSearch?: () => void;
  onExploreMap?: (datasetKey: string) => void;
  mapModeDatasetKey?: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <DatasetCard
          key={item.datasetKey}
          item={item}
          index={index}
          isSelected={selectedDataset?.datasetKey === item.datasetKey}
          onSelect={onSelectDataset}
          onCloseSearch={onCloseSearch}
          onExploreMap={onExploreMap}
          isMapMode={mapModeDatasetKey === item.datasetKey}
        />
      ))}
    </div>
  );
}

function PendingCard({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-dashed
        border-primary/20 bg-card/50 px-3 py-2 animate-pulse"
      aria-busy="true"
    >
      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
      <span className="flex-1 text-xs font-medium text-foreground/70 truncate">
        {name}
      </span>
      <Badge
        variant="secondary"
        className="h-4 text-[9px] px-1.5 bg-primary/10 text-primary"
      >
        …
      </Badge>
    </div>
  );
}

type FederatedSearchOverviewProps = {
  onSearchComplete?: (hasResults: boolean) => void;
  onDatasetSelect?: (dataset: DatasetOverviewRow | null) => void;
  onCloseSearch?: () => void;
  onExploreMap?: (datasetKey: string) => void;
  mapModeDatasetKey?: string | null;
};

const FederatedSearchOverview: React.FC<FederatedSearchOverviewProps> = ({
  onSearchComplete,
  onDatasetSelect,
  onCloseSearch,
  onExploreMap,
  mapModeDatasetKey,
}) => {
  const {
    query,
    datasets,
  } = useFederatedSearchStore();
  const { data: filterData } = useGetFilterData();
  const { data: preData } = useMutatePreFederatedSearch();
  const [selectedDataset, setSelectedDataset] = useState<DatasetOverviewRow | null>(null);

  const searchTerm = (preData?.search_text || query).trim();
  const receivedDatasets = preData?.datasets ?? [];
  const isStreaming = Boolean(preData?.isStreaming);
  const isSearchFinished = Boolean(preData?.isComplete);

  const indicatorLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    filterData?.forEach((category) => {
      category.datasets?.forEach((ds) => {
        (
          (ds as {
            fields?: {
              ontology_mapping: string;
              ontology_mapping_to_display?: string;
            }[];
          }).fields ?? []
        ).forEach((field) => {
          if (field.ontology_mapping) {
            map.set(
              field.ontology_mapping,
              field.ontology_mapping_to_display ?? field.ontology_mapping
            );
          }
        });
      });
    });
    return map;
  }, [filterData]);

  const datasetRows = useMemo((): DatasetOverviewRow[] => {
    return receivedDatasets
      .filter((ds) => ds.available && ds.count > 0)
      .map((ds) => {
        const fieldNames = extractFieldNames(ds.matched_fields);
        return {
          datasetKey: ds.dataset_name,
          datasetName: ds.display_name || ds.dataset_name,
          resultCount: ds.count,
          matchedFields: fieldNames,
          matchedIndicatorLabels: fieldNames.map(
            (field: string) =>
              indicatorLabelByValue.get(field) ?? field.replace(/_/g, " ")
          ),
          hasOccurrence: ds.is_occurrence_available,
        };
      });
  }, [receivedDatasets, indicatorLabelByValue]);

  const noMatchNames = useMemo(
    () =>
      receivedDatasets
        .filter((ds) => !ds.available || ds.count === 0)
        .map((ds) => ds.display_name || ds.dataset_name),
    [receivedDatasets]
  );

  const pendingDatasetNames = useMemo(() => {
    const received = new Set(receivedDatasets.map((ds) => ds.dataset_name));
    return datasets.filter((name) => !received.has(name));
  }, [receivedDatasets, datasets]);

  const hasOverviewData = datasetRows.length > 0;

  const handleSelectDataset = (item: DatasetOverviewRow) => {
    setSelectedDataset(item);
    onDatasetSelect?.(item);
  };

  useEffect(() => {
    setSelectedDataset(null);
  }, [searchTerm]);

  useEffect(() => {
    if (!isSearchFinished) return;
    onSearchComplete?.(hasOverviewData);
  }, [hasOverviewData, isSearchFinished, onSearchComplete]);

  return (
    <div className="w-full space-y-1.5">
      <DatasetGrid
        items={datasetRows}
        selectedDataset={selectedDataset}
        onSelectDataset={handleSelectDataset}
        onCloseSearch={onCloseSearch}
        onExploreMap={onExploreMap}
        mapModeDatasetKey={mapModeDatasetKey}
      />

      {isStreaming &&
        pendingDatasetNames.map((name) => (
          <PendingCard key={`pending-${name}`} name={name} />
        ))}

      {!hasOverviewData && isStreaming && (
        <div
          className="flex items-center justify-center gap-2 rounded-lg
            border border-dashed border-border py-6 text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-xs">Waiting for first dataset…</p>
        </div>
      )}

      {noMatchNames.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2">
          <p
            className="text-[10px] font-medium text-muted-foreground truncate"
            title={noMatchNames.join(", ")}
          >
            No matches ({noMatchNames.length}): {noMatchNames.join(" · ")}
          </p>
        </div>
      )}

      {isStreaming && pendingDatasetNames.length === 0 && (
        <p
          className="flex items-center justify-center gap-2 py-2
            text-[11px] text-muted-foreground"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Finalizing search…
        </p>
      )}
    </div>
  );
};

export default FederatedSearchOverview;
