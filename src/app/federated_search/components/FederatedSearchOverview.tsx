"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Loader2,
  MapPin,
  Check,
  Map as MapIcon,
  ChevronDown,
  SearchX,
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
  dataset_geoserver_name?: string;
  mapFields?: Array<{ field: string; styleName?: string; styleTitle?: string; styleId?: number }>;
  category?: string;
};

type DatasetCardProps = {
  item: DatasetOverviewRow;
  index: number;
  isSelected: boolean;
  onSelect: (item: DatasetOverviewRow, mapKey?: string | null) => void;
  onCloseSearch?: () => void;
  isMapMode?: boolean;
};

function DatasetCard({
  item,
  index,
  isSelected,
  onSelect,
  onCloseSearch,
  isMapMode,
}: DatasetCardProps) {
  const [isMapDropdownOpen, setIsMapDropdownOpen] = useState(false);
  const [selectedMapField, setSelectedMapField] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    onSelect(item);
    onCloseSearch?.();
  };

  const handleMapFieldSelect = (field: string) => {
    setSelectedMapField(field);
    setIsMapDropdownOpen(false);
    onSelect(item, item.datasetKey);
    onCloseSearch?.();
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMapDropdownOpen(false);
      }
    };

    if (isMapDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMapDropdownOpen]);

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
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMapDropdownOpen(!isMapDropdownOpen);
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
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isMapDropdownOpen && "rotate-180")} />
                </button>

                {isMapDropdownOpen && item.mapFields && item.mapFields.length > 0 && (
                  <div className="absolute right-0 mt-1 w-48 rounded-md border border-primary/20 bg-card shadow-lg z-10">
                    {item.mapFields.map((field) => {
                      const isSelected = selectedMapField === field.field;
                      return (
                        <button
                          key={field.field}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMapFieldSelect(field.field);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs font-medium transition-colors border-b border-primary/10 last:border-b-0",
                            isSelected
                              ? "bg-primary/15 border-primary/30 text-primary"
                              : "text-foreground hover:bg-primary/10 hover:text-primary"
                          )}
                        >
                          {field.styleTitle || field.field}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
  mapModeDatasetKey,
}: {
  items: DatasetOverviewRow[];
  selectedDataset: DatasetOverviewRow | null;
  onSelectDataset: (item: DatasetOverviewRow, mapKey?: string | null) => void;
  onCloseSearch?: () => void;
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
  onDatasetSelect?: (dataset: DatasetOverviewRow | null, mapKey?: string | null) => void;
  onCloseSearch?: () => void;
  mapModeDatasetKey?: string | null;
};

const FederatedSearchOverview: React.FC<FederatedSearchOverviewProps> = ({
  onDatasetSelect,
  onCloseSearch,
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
  const isStreaming = Boolean(preData?.isStreaming);
  const isSearchFinished = Boolean(preData?.isComplete);

  const receivedDatasets = useMemo(
    () => preData?.datasets ?? [],
    [preData?.datasets]
  );

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
          dataset_geoserver_name: ds.dataset_geoserver_name,
          mapFields: ds.matched_fields?.map || [],
          category: ds.category,
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

  const handleSelectDataset = (item: DatasetOverviewRow, mapKey?: string | null) => {
    setSelectedDataset(item);
    onDatasetSelect?.(item, mapKey);
  };

  useEffect(() => {
    setSelectedDataset(null);
  }, [searchTerm]);

  return (
    <div className="w-full space-y-1.5">
      <DatasetGrid
        items={datasetRows}
        selectedDataset={selectedDataset}
        onSelectDataset={handleSelectDataset}
        onCloseSearch={onCloseSearch}
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

      {!hasOverviewData && isSearchFinished && (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg
            border border-dashed border-border px-6 py-10 text-center"
          role="status"
          aria-live="polite"
        >
          <SearchX className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">
            No matches for &quot;{searchTerm}&quot;
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            None of the selected datasets returned results. Try a different
            keyword, or add more indicators and search again.
          </p>
        </div>
      )}

      {hasOverviewData && noMatchNames.length > 0 && (
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
