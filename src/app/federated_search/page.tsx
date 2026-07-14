"use client";

import React, { Suspense, useCallback } from "react";
import FederatedSearchBar from "@/app/federated_search/components/FederatedSearchBar";
import { useOverviewStats } from "@/app/federated_search/hooks/useOverviewStats";
import { useSearchLogic } from "@/app/federated_search/hooks/useSearchLogic";
import { useResultsData } from "@/app/federated_search/hooks/useResultsData";
import { DatasetOverviewRow } from "@/app/federated_search/components/FederatedSearchOverview";
import { SearchLandingSection } from "@/app/federated_search/ui/SearchLandingSection";
import { SearchFormPanel } from "@/app/federated_search/ui/SearchFormPanel";
import { ResultsPanel } from "@/app/federated_search/ui/ResultsPanel";
import { DetailPanel } from "@/app/federated_search/ui/DetailPanel";
import { cn } from "@/lib/utils";

const FederatedSearchContent = () => {
  const overviewStats = useOverviewStats();
  const [mapModeDatasetKey, setMapModeDatasetKey] = React.useState<string | null>(null);

  const {
    searchInputRef,
    isToggleActive,
    setIsToggleActive,
    layoutMode,
    showOverview,
    setShowOverview,
    showResultsView,
    setShowResultsView,
    searchDraft,
    setSearchDraft,
    searchError,
    selectedDataset,
    setSelectedDataset,
    resultKeys,
    indicatorList,
    selectedIndicatorLabels,
    isFilterLoading,
    isFilterError,
    refetchFilter,
    isLoading,
    isError,
    isPreLoading,
    preData,
    data,
    hasActiveSearch,
    categories,
    datasets,
    indicators,
    query,
    handleIndicatorsChange,
    handleSearch,
    handleNewSearch,
    mutate,
  } = useSearchLogic();

  const { totalResultCount, flattenedData, sourcesWithResults, sourcesQueried, fieldColumns } =
    useResultsData(data, "");

  const isSearchLanding = layoutMode === "landing";
  const showResultsPanel = layoutMode === "results";
  const isFormBusy = isPreLoading || isFilterLoading;
  const indicatorsReady = !isFilterLoading && !isFilterError && indicatorList.length > 0;
  const hasDatasets = datasets.length > 0;
  const hasIndicators = indicators.length > 0;
  const hasSearchTerm = searchDraft.trim().length > 0;
  const isSearchReady =
    hasDatasets &&
    hasIndicators &&
    hasSearchTerm &&
    indicatorsReady &&
    !isFormBusy;

  const handleDatasetSelect = useCallback(
    (dataset: DatasetOverviewRow | null) => {
      setSelectedDataset(dataset);
      setMapModeDatasetKey(null);
      if (dataset) {
        const matchedDataset = preData?.datasets?.find(
          (ds) => ds.dataset_name === dataset.datasetKey
        );
        const tabularFields = matchedDataset?.matched_fields?.tabular || [];

        mutate({
          category: categories,
          dataset: [dataset.datasetKey],
          search_text: query,
          fields: tabularFields,
        });
      }
    },
    [categories, query, preData, mutate, setSelectedDataset]
  );

  const handleSearchComplete = useCallback(
    (hasResults: boolean) => {
      if (preData?.hasError) return;
      if (!hasResults) {
        setShowOverview(false);
      }
    },
    [preData?.hasError, setShowOverview]
  );

  return (
    <div className="h-screen flex">
      {/* Left: Search Bar Sidebar */}
      <div
        className={cn(
          "shrink-0 border-r border-border bg-card flex flex-col min-h-0 overflow-hidden transition-all duration-300",
          isToggleActive ? "w-0 opacity-0 pointer-events-none" : "w-[350px]"
        )}
      >
        <FederatedSearchBar />
      </div>

      <div className="flex-1 flex gap-0 overflow-visible relative">
        {/* Left side: Search Panel */}
        <div
          className={cn(
            "flex flex-col overflow-visible bg-background transition-all duration-300",
            isToggleActive
              ? "w-0 opacity-0 pointer-events-none"
              : showResultsPanel
              ? "w-3/5"
              : "w-full"
          )}
        >
         

          <div className="flex-1 flex flex-col min-h-0 overflow-auto bg-background">
            <SearchLandingSection
              isSearchLanding={isSearchLanding}
              isFilterLoading={isFilterLoading}
              isFilterError={isFilterError}
              indicatorList={indicatorList}
              searchError={searchError}
              onRetryFilters={refetchFilter}
            >
              <SearchFormPanel
                indicators={indicators}
                indicatorList={indicatorList}
                selectedIndicatorLabels={selectedIndicatorLabels}
                searchDraft={searchDraft}
                isFilterLoading={isFilterLoading}
                indicatorsReady={indicatorsReady}
                isFormBusy={isFormBusy}
                hasDatasets={hasDatasets}
                hasIndicators={hasIndicators}
                hasSearchTerm={hasSearchTerm}
                isSearchReady={isSearchReady}
                showResultsPanel={showResultsPanel}
                onIndicatorChange={handleIndicatorsChange}
                onSearchDraftChange={setSearchDraft}
                onSearch={handleSearch}
                onNewSearch={showResultsPanel ? handleNewSearch : undefined}
                searchInputRef={searchInputRef as React.RefObject<HTMLInputElement>}
              />
            </SearchLandingSection>
          </div>
        </div>

        {/* Right side: Results Panel */}
        <div
          className={cn(
            "flex flex-col overflow-hidden border-l border-border bg-card transition-all duration-300",
            isToggleActive
              ? showResultsPanel ? "w-2/5" : "hidden"
              : showResultsPanel ? "w-2/5" : "hidden"
          )}
        >
          <ResultsPanel
            showResultsPanel={showResultsPanel}
            isPreLoading={isPreLoading}
            isLoading={isLoading}
            isError={isError}
            preData={preData}
            overviewStats={overviewStats}
            hasActiveSearch={hasActiveSearch}
            showOverview={showOverview}
            resultKeys={resultKeys}
            showResultsView={showResultsView}
            query={query}
            selectedDataset={selectedDataset}
            totalResultCount={totalResultCount}
            flattenedData={flattenedData}
            sourcesQueried={sourcesQueried}
            sourcesWithResults={sourcesWithResults}
            fieldColumns={fieldColumns}
            isToggleActive={isToggleActive}
            mapModeDatasetKey={mapModeDatasetKey}
            selectedDatasets={datasets}
            onSearchComplete={handleSearchComplete}
            onDatasetSelect={handleDatasetSelect}
            onCloseResults={() => setShowResultsView(false)}
            onNewSearch={handleNewSearch}
            onCloseSearch={() => setIsToggleActive(true)}
            onOpenSearch={() => setIsToggleActive(false)}
            onExploreMap={(datasetKey) => setMapModeDatasetKey(datasetKey)}
          />
        </div>

        {/* Right side: Detail Panel (only show when search is closed) */}
        {isToggleActive && showResultsPanel && (
          <div className="flex-1 flex flex-col overflow-hidden border-l border-border bg-card transition-all duration-300">
            <DetailPanel
              selectedDataset={selectedDataset}
              flattenedData={flattenedData}
              fieldColumns={fieldColumns}
              isToggleActive={isToggleActive}
              mapModeDatasetKey={mapModeDatasetKey}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const FederatedSearchFallback = () => (
  <div className="h-screen flex items-center justify-center text-muted-foreground">
    Loading…
  </div>
);

const Page = () => (
  <Suspense fallback={<FederatedSearchFallback />}>
    <FederatedSearchContent />
  </Suspense>
);

export default Page;
