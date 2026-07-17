"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Loader2, MapPin, RotateCcw, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FederatedSearchOverview, { DatasetOverviewRow } from "@/app/federated_search/components/FederatedSearchOverview";
import FederatedDataTable from "@/app/federated_search/components/FederatedDataTable";
import { DataItem, PreFederatedSearchData } from "@/types/api/federatedSearch.types";
import type { OverviewStats } from "@/app/federated_search/hooks/useOverviewStats";
import { OverviewHeaderStats } from "@/app/federated_search/stats/OverviewHeaderStats";
import { cn } from "@/lib/utils";

interface ResultsPanelProps {
  showResultsPanel: boolean;
  isPreLoading: boolean;
  isLoading: boolean;
  isError: boolean;
  preData: PreFederatedSearchData | undefined;
  overviewStats: OverviewStats;
  hasActiveSearch: boolean;
  showOverview: boolean;
  resultKeys: string[];
  showResultsView: boolean;
  query: string;
  selectedDataset: DatasetOverviewRow | null;
  totalResultCount: number;
  flattenedData: DataItem[];
  sourcesQueried: number;
  sourcesWithResults: number;
  fieldColumns: string[];
  isToggleActive: boolean;
  mapModeDatasetKey?: string | null;
  selectedDatasets: string[];
  onDatasetSelect: (dataset: DatasetOverviewRow | null, mapKey?: string | null) => void;
  onCloseResults: () => void;
  onNewSearch: () => void;
  onCloseSearch: () => void;
  onOpenSearch?: () => void;
}

export function ResultsPanel({
  showResultsPanel,
  isPreLoading,
  isLoading,
  isError,
  preData,
  overviewStats,
  hasActiveSearch,
  showOverview,
  resultKeys,
  showResultsView,
  query,
  selectedDataset,
  totalResultCount,
  flattenedData,
  sourcesQueried,
  sourcesWithResults,
  fieldColumns,
  isToggleActive,
  mapModeDatasetKey,
  onDatasetSelect,
  onCloseResults,
  onNewSearch,
  onCloseSearch,
  onOpenSearch,
}: ResultsPanelProps) {
  if (!showResultsPanel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <p className="text-sm">No results yet. Use the search panel on the left to explore datasets.</p>
      </div>
    );
  }

  return (
    <>
      {resultKeys.length > 0 && showResultsView ? (
        <>
          <header
            className="shrink-0 border-b border-border border-l-4 border-l-primary bg-primary/5 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
            role="region"
            aria-label="Results summary"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-7 text-xs font-medium"
                onClick={onCloseResults}
              >
                ← Close results
              </Button>
              {!isToggleActive && (
                <>
                  <span className="text-sm text-foreground flex items-center gap-2 flex-wrap" aria-live="polite">
                    <span>Results for</span>
                    <span className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 font-semibold text-primary ring-1 ring-primary/20">
                      &quot;{query || "—"}&quot;
                    </span>
                    {selectedDataset && (
                      <>
                        <span className="text-muted-foreground">in</span>
                        <span className="inline-flex items-center rounded-md bg-accent/15 px-2 py-0.5 font-semibold text-accent ring-1 ring-accent/20">
                          {selectedDataset.datasetName}
                        </span>
                      </>
                    )}
                    <span>
                      <strong className="font-semibold text-foreground">
                        {selectedDataset
                          ? flattenedData.filter((item) => item.dataset === selectedDataset.datasetKey).length.toLocaleString()
                          : totalResultCount.toLocaleString()}
                      </strong>{" "}
                      {selectedDataset
                        ? flattenedData.filter((item) => item.dataset === selectedDataset.datasetKey).length === 1
                          ? "record"
                          : "records"
                        : totalResultCount === 1
                          ? "record"
                          : "records"}
                    </span>
                    {!selectedDataset && sourcesQueried > 0 && (
                      <span className="text-muted-foreground font-normal">
                        {sourcesQueried === 1
                          ? "from 1 source"
                          : `from ${sourcesWithResults} of ${sourcesQueried} sources`}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-7 text-xs font-medium gap-1.5 bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 hover:bg-primary/90"
                      asChild
                    >
                      <Link href="/map_search">
                        <MapPin className="h-4 w-4" />
                        Explore Map Search
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-medium gap-1.5"
                      asChild
                    >
                      <Link href="/contribute">Want to contribute?</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </header>

          <div className="flex-1 min-w-0 overflow-auto">
            {selectedDataset ? (
              isToggleActive ? (
                <CardListView data={flattenedData.filter((item) => item.dataset === selectedDataset.datasetKey)} fieldColumns={fieldColumns} />
              ) : (
                <FederatedDataTable
                  isLoading={isLoading}
                  isError={isError}
                  data={flattenedData.filter((item) => item.dataset === selectedDataset.datasetKey)}
                  fieldColumns={fieldColumns}
                />
              )
            ) : isToggleActive ? (
              <CardListView data={flattenedData} fieldColumns={fieldColumns} />
            ) : (
              <FederatedDataTable isLoading={isLoading} isError={isError} data={flattenedData} fieldColumns={fieldColumns} />
            )}
          </div>
        </>
      ) : (
        <div
          className={cn(
            "flex-1 min-h-0 overflow-auto p-2",
            "animate-in fade-in-0 slide-in-from-bottom-6 duration-[1100ms] ease-in-out"
          )}
          aria-busy={isPreLoading || overviewStats.isStreaming}
        >
          {preData?.hasError && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 px-6 text-center" role="alert">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm text-destructive max-w-md">{preData.errorMessage ?? "Search failed. Please try again."}</p>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onNewSearch}>
                <RotateCcw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          )}

          {!preData?.hasError && isPreLoading && !preData?.datasets?.length && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground" role="status" aria-live="polite">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Querying datasets…</p>
              <p className="text-xs text-muted-foreground/80">Results will appear as each source responds.</p>
            </div>
          )}

          {!preData?.hasError && showOverview && hasActiveSearch && (preData?.datasets?.length || !isPreLoading) && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Overview Header */}
              <div className="shrink-0 border-b border-border bg-card/50 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <OverviewHeaderStats
                    query={query}
                    selectedDatasetsCount={overviewStats.selectedDatasetsCount}
                    datasetsWithResultsCount={overviewStats.datasetsWithResultsCount}
                    selectedIndicators={overviewStats.selectedIndicators}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isToggleActive ? onOpenSearch : onCloseSearch}
                  className="shrink-0 gap-1.5 px-2"
                  title={isToggleActive ? "Back to search" : "View details"}
                >
                  {isToggleActive ? (
                    <>
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-xs font-medium">Back to Search</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-medium">View Details</span>
                    </>
                  )}
                </Button>
              </div>
              {/* Overview Content */}
              <div className="flex-1 min-w-0 overflow-auto">
                <FederatedSearchOverview onDatasetSelect={onDatasetSelect} onCloseSearch={onCloseSearch} mapModeDatasetKey={mapModeDatasetKey} />
              </div>
            </div>
          )}

          {!preData?.hasError && !showOverview && !isPreLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              {isToggleActive ? (
                <>
                  <p className="text-sm font-medium mb-2">Results will appear here</p>
                  <p className="text-xs text-muted-foreground/70">
                    Close the search panel to see results after performing a search.
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Select datasets in the sidebar, pick indicators, and search.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CardListView({ data, fieldColumns }: { data: DataItem[]; fieldColumns: string[] }) {
  return (
    <div className="p-4 space-y-3">
      {data.map((item, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all shadow-sm"
        >
          <div className="space-y-3">
            {fieldColumns.slice(0, 4).map((field) => (
              <div key={field} className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field}</p>
                <p className="text-sm text-foreground break-words font-medium line-clamp-2">{String(item[field as keyof DataItem] ?? "—")}</p>
              </div>
            ))}
          </div>
          {fieldColumns.length > 4 && (
            <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border/40">
              +{fieldColumns.length - 4} more fields
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
