"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
} from "lucide-react";
import FederatedDataTable from "@/app/federated_search/FederatedDataTable";
import { GetFederatedSearchByPayload } from "@/api/federatedSearchApiHandler/FederatedSearchBaseApiHandler";
import {
  useGetFilterData,
  useMutatePreFederatedSearch,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DataItem,
  FederatedSearchData,
  PreFederatedSearchPayload,
} from "@/types/api/federatedSearch.types";
import { cn } from "@/lib/utils";

function extractFieldNames(matchedFields: {
  tabular: string[];
  map: Array<{ field: string }>;
}): string[] {
  return matchedFields.tabular;
}

type DatasetOverviewRow = {
  datasetKey: string;
  datasetName: string;
  resultCount: number;
  matchedFields: string[];
  matchedIndicatorLabels: string[];
  hasOccurrence: boolean;
};

type RowExpansionState = {
  status: "loading" | "success" | "error";
  rows: DataItem[];
  fieldColumns: string[];
};

function resolveSearchFields(
  matchedFields: string[],
  selected: string[]
): string[] {
  if (matchedFields.length > 0) return matchedFields;
  return selected;
}

function parseDatasetResults(
  response: FederatedSearchData,
  datasetKey: string
): { rows: DataItem[]; fieldColumns: string[] } {
  const source = response?.results?.[datasetKey];
  if (!source) return { rows: [], fieldColumns: [] };

  const fieldResults = source.field_results ?? {};
  const isOccurrenceAvailable = source.is_occurrence_available ?? false;
  const rows = Object.values(fieldResults).flatMap(
    (field: { results?: DataItem[] }) =>
      (field?.results ?? []).map((row) => ({
        ...row,
        dataset: datasetKey,
        is_occurrence_available: isOccurrenceAvailable,
      }))
  );
  const derivedFields = Object.keys(fieldResults);
  const fieldColumns =
    response.fields && response.fields.length > 0
      ? response.fields
      : derivedFields;

  return { rows, fieldColumns };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-7 rounded bg-muted/60 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

type AccordionItemProps = {
  item: DatasetOverviewRow;
  index: number;
  isLast: boolean;
  expansion?: RowExpansionState;
  onToggleExpand: (item: DatasetOverviewRow) => void;
  onExploreMap?: (item: DatasetOverviewRow) => void;
  isExploringMap?: boolean;
};

function AccordionItem({
  item,
  index,
  isLast,
  expansion,
  onToggleExpand,
  onExploreMap,
  isExploringMap,
}: AccordionItemProps) {
  const isExpanded = Boolean(expansion);
  const isLoading = expansion?.status === "loading";
  const isSuccess = expansion?.status === "success";

  return (
    <div
      className={cn(
        "group",
        isExpanded && "bg-primary/[0.03]",
        !isLast && !isExpanded && "border-b border-border/70"
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2.5 text-left",
          "transition-colors hover:bg-muted/40",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-primary/30 focus-visible:ring-inset",
          isExpanded && "border-b border-primary/15"
        )}
        onClick={() => onToggleExpand(item)}
        disabled={isLoading}
        aria-expanded={isExpanded}
        aria-controls={`accordion-panel-${item.datasetKey}`}
        id={`accordion-trigger-${item.datasetKey}`}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            "duration-200",
            isExpanded && "rotate-180 text-primary",
            isLoading && "opacity-40"
          )}
          aria-hidden
        />

        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded",
            "text-[10px] font-bold tabular-nums",
            isExpanded
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className={cn(
                "text-sm font-semibold line-clamp-1",
                isExpanded ? "text-primary" : "text-foreground"
              )}
              title={item.datasetName}
            >
              {item.datasetName}
            </span>
            {item.hasOccurrence && (
              <Badge
                variant="outline"
                className="h-4 gap-0.5 px-1 text-[9px] border-primary/25
                  text-primary bg-primary/5"
              >
                <MapPin className="h-2 w-2" />
                Map
              </Badge>
            )}
            {item.matchedIndicatorLabels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="hidden md:inline rounded bg-muted px-1 py-px
                  text-[9px] text-muted-foreground truncate max-w-[90px]"
                title={label}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums",
            isExpanded ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
          )}
        >
          {item.resultCount.toLocaleString()}
        </span>

        {item.hasOccurrence && (
          <button
            type="button"
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-md border px-1.5",
              "py-0.5 text-[10px] font-medium transition-colors",
              "border-primary/25 bg-primary/10 text-primary",
              "hover:bg-primary/15",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary/30 focus-visible:ring-inset"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onExploreMap?.(item);
            }}
            aria-label={`Explore ${item.datasetName} on map`}
            title="Explore on map"
          >
            <MapPin className="h-3 w-3" aria-hidden />
            <span className="hidden sm:inline">Explore on Map</span>
          </button>
        )}

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-md border px-2",
            "py-0.5 text-[11px] font-medium",
            isLoading
              ? "border-border text-muted-foreground"
              : isExpanded
                ? "border-primary/25 bg-primary/10 text-primary"
                : "border-border bg-muted/50 text-muted-foreground"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Loading
            </>
          ) : isExpanded ? (
            <>
              <Minimize2 className="h-3 w-3" aria-hidden />
              Collapse
            </>
          ) : (
            <>
              <Maximize2 className="h-3 w-3" aria-hidden />
              Expand
            </>
          )}
        </span>
      </button>

      <div
        id={`accordion-panel-${item.datasetKey}`}
        role="region"
        aria-labelledby={`accordion-trigger-${item.datasetKey}`}
        className={cn(
          "grid transition-all duration-200 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {isExploringMap && (
            <div
              className="flex items-center justify-center gap-2 py-6 px-3
                border-t border-primary/20 bg-primary/5"
            >
              <MapPin className="h-5 w-5 text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-primary">
                  Map view for {item.datasetName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Coming soon - will display occurrence data on map
                </p>
              </div>
            </div>
          )}

          {expansion?.status === "loading" && (
            <div className="px-3 py-1">
              <LoadingSkeleton />
            </div>
          )}

          {expansion?.status === "error" && (
            <div
              className="flex items-center justify-center gap-2 py-3 px-3
                border-t border-border/60"
            >
              <p className="text-xs text-destructive font-medium">
                Failed to load
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[11px] px-2"
                onClick={() => onToggleExpand(item)}
              >
                Retry
              </Button>
            </div>
          )}

          {isSuccess && (
            <div className="max-h-[min(52vh,560px)] overflow-auto">
              <FederatedDataTable
                embedded
                isLoading={false}
                isError={false}
                data={expansion.rows}
                fieldColumns={expansion.fieldColumns}
                onSearch={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DatasetAccordion({
  items,
  expandedRows,
  onToggleExpand,
  onExploreMap,
  exploringMapDataset,
}: {
  items: DatasetOverviewRow[];
  expandedRows: Record<string, RowExpansionState>;
  onToggleExpand: (item: DatasetOverviewRow) => void;
  onExploreMap?: (item: DatasetOverviewRow) => void;
  exploringMapDataset?: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-border bg-card overflow-hidden
        shadow-sm divide-y divide-border/70"
      role="presentation"
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.datasetKey}
          item={item}
          index={index}
          isLast={index === items.length - 1}
          expansion={expandedRows[item.datasetKey]}
          onToggleExpand={onToggleExpand}
          onExploreMap={onExploreMap}
          isExploringMap={exploringMapDataset === item.datasetKey}
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

type OverviewStats = {
  searchTerm: string;
  totalResultCount: number;
  datasetCount: number;
  expandedCount: number;
  progressPct: number;
  checkedCount: number;
  totalExpected: number;
  isStreaming: boolean;
  isSearchFinished: boolean;
  hasOverviewData: boolean;
};

export function FederatedSearchOverviewStats({
  stats,
}: {
  stats: OverviewStats;
}) {
  const {
    searchTerm,
    totalResultCount,
    datasetCount,
    expandedCount,
    progressPct,
    checkedCount,
    totalExpected,
    isStreaming,
    isSearchFinished,
    hasOverviewData,
  } = stats;

  if (!searchTerm && !isStreaming && !isSearchFinished) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]"
      aria-live="polite"
      aria-busy={isStreaming}
    >
      <span className="font-semibold text-primary truncate max-w-[200px]">
        &quot;{searchTerm || "—"}&quot;
      </span>
      {hasOverviewData && (
        <span className="text-muted-foreground tabular-nums">
          {totalResultCount.toLocaleString()} hits · {datasetCount} src
          {expandedCount > 0 && ` · ${expandedCount} open`}
        </span>
      )}
      <div className="flex items-center gap-1.5 ml-auto">
        <div
          className="h-1.5 w-16 sm:w-20 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isStreaming ? "bg-primary" : "bg-emerald-500"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-muted-foreground tabular-nums">
          {checkedCount}/{totalExpected || "—"}
        </span>
        {isStreaming ? (
          <Badge
            className="h-5 gap-0.5 px-1.5 bg-primary/10 text-primary
              border-primary/20 text-[10px]"
          >
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Live
          </Badge>
        ) : isSearchFinished ? (
          <Badge
            className="h-5 gap-0.5 px-1.5 bg-emerald-500/10 text-emerald-700
              border-emerald-500/20 text-[10px] dark:text-emerald-400"
          >
            <CheckCircle2 className="h-2.5 w-2.5" />
            Done
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

type FederatedSearchOverviewProps = {
  onSearchComplete?: (hasResults: boolean) => void;
};

const FederatedSearchOverview: React.FC<FederatedSearchOverviewProps> = ({
  onSearchComplete,
}) => {
  const {
    query,
    categories,
    datasets,
    indicators: selectedIndicators,
  } = useFederatedSearchStore();
  const { data: filterData } = useGetFilterData();
  const { data: preData } = useMutatePreFederatedSearch();
  const [expandedRows, setExpandedRows] = useState<
    Record<string, RowExpansionState>
  >({});
  const [exploringMapDataset, setExploringMapDataset] = useState<string | null>(
    null
  );

  const searchTerm = (preData?.search_text || query).trim();
  const selected = selectedIndicators.filter(Boolean);
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

  const buildFederatedPayload = (
    datasetList: string[],
    fields: string[]
  ): PreFederatedSearchPayload => ({
    category: categories,
    dataset: datasetList,
    search_text: searchTerm,
    fields,
  });

  const handleToggleExpand = async (item: DatasetOverviewRow) => {
    const key = item.datasetKey;

    if (expandedRows[key]) {
      setExpandedRows((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const fields = resolveSearchFields(item.matchedFields, selected);
    if (!fields.length) {
      toast.error("No indicator fields available for this dataset.");
      return;
    }

    setExpandedRows((prev) => ({
      ...prev,
      [key]: { status: "loading", rows: [], fieldColumns: [] },
    }));

    try {
      const response = (await GetFederatedSearchByPayload(
        "/federated-search",
        buildFederatedPayload([key], fields)
      )) as FederatedSearchData;
      const { rows, fieldColumns } = parseDatasetResults(response, key);

      setExpandedRows((prev) => ({
        ...prev,
        [key]: { status: "success", rows, fieldColumns },
      }));
    } catch {
      setExpandedRows((prev) => ({
        ...prev,
        [key]: { status: "error", rows: [], fieldColumns: [] },
      }));
      toast.error(`Failed to load records for ${item.datasetName}.`);
    }
  };

  const handleExploreMap = (item: DatasetOverviewRow) => {
    setExploringMapDataset(
      exploringMapDataset === item.datasetKey ? null : item.datasetKey
    );
  };

  useEffect(() => {
    setExpandedRows({});
    setExploringMapDataset(null);
  }, [searchTerm]);

  useEffect(() => {
    if (!isSearchFinished) return;
    onSearchComplete?.(hasOverviewData);
  }, [hasOverviewData, isSearchFinished, onSearchComplete]);

  return (
    <div className="w-full space-y-1.5">
      <DatasetAccordion
        items={datasetRows}
        expandedRows={expandedRows}
        onToggleExpand={handleToggleExpand}
        onExploreMap={handleExploreMap}
        exploringMapDataset={exploringMapDataset}
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

export function useOverviewStats() {
  const { query, datasets } = useFederatedSearchStore();
  const { data: preData } = useMutatePreFederatedSearch();

  const searchTerm = (preData?.search_text || query).trim();
  const receivedDatasets = preData?.datasets ?? [];
  const isStreaming = Boolean(preData?.isStreaming);
  const isSearchFinished = Boolean(preData?.isComplete);

  const datasetRows = useMemo(
    () => receivedDatasets.filter((ds) => ds.available && ds.count > 0),
    [receivedDatasets]
  );

  const totalResultCount = useMemo(
    () => datasetRows.reduce((sum, row) => sum + row.count, 0),
    [datasetRows]
  );

  const totalExpected = datasets.length;
  const checkedCount = receivedDatasets.length;
  const progressPct =
    totalExpected > 0
      ? Math.min(100, Math.round((checkedCount / totalExpected) * 100))
      : isSearchFinished
        ? 100
        : 0;

  return {
    searchTerm,
    totalResultCount,
    datasetCount: datasetRows.length,
    progressPct,
    checkedCount,
    totalExpected,
    isStreaming,
    isSearchFinished,
    hasOverviewData: datasetRows.length > 0,
  };
}

export default FederatedSearchOverview;
