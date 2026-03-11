"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import FederatedSearchBar from "@/app/federated_search/FederatedSearchBar";
import { LocateFixed, LocateOff, MapPin, Search, Table2 } from "lucide-react";
import InstructionPopover from "@/element/popover/InstructionPopover";
import BaseMap from "@/components/map/BaseMap";
import AddMarker from "@/components/mapFeatures/addMarker/AddMarker";
import {
  useGetFilterData,
  useMutateFederatedSearch,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import FederatedDataTable from "./FederatedDataTable";
import useFederatedSearchMapData from "@/store/federated_search_store/useFederatedSearchMapData";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import { Option } from "@/types/app/federatedSearch.types";
import { DataItem } from "@/types/api/federatedSearch.types";
import { toast } from "sonner";

const Page = () => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { selectedCoordinates, visibleMarkers } = useFederatedSearchMapData();
  const { categories, datasets, indicators, query, setQuery, setIndicators, setCategories, setDatasets } =
    useFederatedSearchStore();
  const { data: filterData } = useGetFilterData();
  const {
    data,
    isError,
    mutate,
    isMutating: isLoading,
  } = useMutateFederatedSearch();

  const resultKeys = Object.keys(data?.results || {});
  // When true: show results (single table). When false: show search/indicator UI.
  const [showResultsView, setShowResultsView] = useState(false);
  const searchJustSubmittedRef = useRef(false);

  const { totalResultCount, flattenedData, sourcesWithResults, sourcesQueried, fieldColumns } = useMemo(() => {
    if (!data?.results) {
      return {
        totalResultCount: 0,
        flattenedData: [] as DataItem[],
        sourcesWithResults: 0,
        sourcesQueried: 0,
        fieldColumns: [] as string[],
      };
    }
    const resultKeys = Object.keys(data.results);
    const flattened: DataItem[] = [];
    let sourcesWithResultsCount = 0;
    // Use API's top-level fields for column order; fallback to first dataset's field_results keys
    const apiFields = data.fields && data.fields.length > 0 ? data.fields : null;
    const firstSource = Object.values(data.results)[0];
    const derivedFields = firstSource?.field_results ? Object.keys(firstSource.field_results) : [];
    const fieldColumnsList = apiFields ?? derivedFields;

    Object.entries(data.results).forEach(([datasetKey, source]) => {
      const fieldResults = source?.field_results ?? {};
      const isOccurrenceAvailable = source?.is_occurance_available ?? false;
      const rows = Object.values(fieldResults).flatMap(
        (field: { results?: DataItem[] }) =>
          (field?.results ?? []).map((row) => ({
            ...row,
            dataset: datasetKey,
            is_occurance_available: isOccurrenceAvailable,
          }))
      );
      if (rows.length > 0) sourcesWithResultsCount += 1;
      flattened.push(...rows);
    });
    return {
      totalResultCount: flattened.length,
      flattenedData: flattened,
      sourcesWithResults: sourcesWithResultsCount,
      sourcesQueried: resultKeys.length,
      fieldColumns: fieldColumnsList,
    };
  }, [data?.results, data?.fields]);

  // All possible indicators from all categories/datasets (no dependency on selection)
  const indicatorList: Option[] = useMemo(() => {
    if (!filterData) return [];
    const seen = new Set<string>();
    const options: Option[] = [];
    filterData.forEach((category) => {
      category.datasets?.forEach((ds) => {
        (
          (ds as { fields?: { ontology_mapping_to_display?: string; ontology_mapping: string }[] }).fields ?? []
        ).forEach((field) => {
          const value = field.ontology_mapping;
          if (value && !seen.has(value)) {
            seen.add(value);
            options.push({
              label: field.ontology_mapping_to_display ?? value,
              value,
            });
          }
        });
      });
    });
    return options;
  }, [filterData]);

  // Map each indicator value to { categories, datasets } that provide it (for auto-selection)
  const fieldToSources = useMemo(() => {
    const map = new Map<string, { categories: string[]; datasets: string[] }>();
    if (!filterData) return map;
    filterData.forEach((category) => {
      category.datasets?.forEach((ds) => {
        const dsTitle = ds.dataset_title;
        const fields = (ds as { fields?: { ontology_mapping: string }[] }).fields ?? [];
        fields.forEach((field) => {
          const value = field.ontology_mapping;
          if (!value) return;
            const entry = map.get(value) ?? { categories: [], datasets: [] };
            if (!entry.categories.includes(category.category_name)) {
              entry.categories.push(category.category_name);
            }
            if (!entry.datasets.includes(dsTitle)) {
              entry.datasets.push(dsTitle);
            }
            map.set(value, entry);
        });
      });
    });
    return map;
  }, [filterData]);

  const handleIndicatorsChange = (val: string[]) => {
    setIndicators(val);
    if (val.length === 0) {
      setCategories([]);
      setDatasets([]);
      return;
    }
    // Recompute from selected indicators only: keep only categories/datasets that have at least one selected indicator
    const catSet = new Set<string>();
    const dsSet = new Set<string>();
    val.forEach((fieldValue) => {
      const sources = fieldToSources.get(fieldValue);
      if (sources) {
        sources.categories.forEach((c) => catSet.add(c));
        sources.datasets.forEach((d) => dsSet.add(d));
      }
    });
    setCategories(Array.from(catSet));
    setDatasets(Array.from(dsSet));
  };

  const handleSearch = () => {
    const inputValue = searchInputRef.current?.value.trim() ?? "";
    if (!categories.length) return toast.error("Please select a category.");
    if (!datasets.length) return toast.error("Please select a dataset.");
    if (!indicators.length)
      return toast.error("Please select at least one indicator.");
    if (!inputValue) return toast.error("Please enter a search term.");
    setQuery(inputValue);
    searchJustSubmittedRef.current = true; // so when results arrive we switch to results view
    mutate({
      category: categories,
      dataset: datasets,
      search_text: inputValue,
      fields: indicators,
    });
  };

  useEffect(() => {
    const hasResults = resultKeys.length > 0;
    if (hasResults && searchJustSubmittedRef.current) {
      searchJustSubmittedRef.current = false;
      setShowResultsView(true);
    }
    if (!hasResults) setShowResultsView(false);
  }, [resultKeys]);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-[350px] shrink-0 border-r border-border bg-card flex flex-col min-h-0 overflow-hidden">
        {/* Header: Explore Dataset + Show/Hide map */}
        <header className="shrink-0 border-b border-border bg-muted/20">
          <div className="flex flex-nowrap items-center justify-between gap-2 px-3 py-2.5 min-h-[40px]">
            <InstructionPopover title="Explore Dataset" icon={<Search className="h-4 w-4" />}>
              <p>
                Explore Dataset queries multiple remote databases and returns
                unified results in a single view.
              </p>
            </InstructionPopover>
            {isMapVisible ? (
              <button
                type="button"
                title="Hide Map"
                onClick={() => setIsMapVisible(false)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                aria-label="Hide map"
              >
                <LocateOff size={14} />
                <span className="whitespace-nowrap">Hide map</span>
              </button>
            ) : (
              <button
                type="button"
                title="Show Map"
                onClick={() => setIsMapVisible(true)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Show map"
              >
                <LocateFixed size={14} />
                <span className="whitespace-nowrap">Show map</span>
              </button>
            )}
          </div>
        </header>

        <FederatedSearchBar mutate={mutate} />
      </div>

      {/* Right Section (Map + Tabs + Table) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map Section - inside right side only */}
        <div
          className={`transition-all duration-500 overflow-hidden shadow-lg ${
            isMapVisible ? "h-[50vh]" : "h-0"
          }`}
        >
          {isMapVisible && (
            <div className="h-full w-full">
              <BaseMap />
              <AddMarker markers={visibleMarkers} flyTo={selectedCoordinates} />
            </div>
          )}
        </div>

        {resultKeys.length > 0 && showResultsView ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in-0 duration-200" key="results-view">
            {/* Results view: breadcrumb + tabs */}
            <header className="shrink-0 border-b border-border border-l-4 border-l-primary bg-primary/5 flex flex-wrap items-center justify-between gap-3 px-4 py-3" role="region" aria-label="Results summary">
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-8 text-xs font-medium"
                  onClick={() => {
                    setShowResultsView(false);
                    setIsMapVisible(false);
                  }}
                >
                  ← Back to search
                </Button>
                <span className="text-muted-foreground/70 hidden sm:inline">·</span>
                <span className="text-sm text-foreground flex items-center gap-2 flex-wrap" aria-live="polite">
                  <span>Results for</span>
                  <span className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 font-semibold text-primary ring-1 ring-primary/20">
                    &quot;{query || "—"}&quot;
                  </span>
                  <span>
                    <strong className="font-semibold text-foreground">{totalResultCount.toLocaleString()}</strong>{" "}
                    {totalResultCount === 1 ? "record" : "records"}
                  </span>
                  {sourcesQueried > 0 && (
                    <span className="text-muted-foreground font-normal">
                      {sourcesQueried === 1
                        ? "from 1 source"
                        : `from ${sourcesWithResults} of ${sourcesQueried} sources`}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 text-xs font-medium gap-1.5 bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 hover:bg-primary/90"
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
                  className="h-8 text-xs font-medium gap-1.5"
                  asChild
                >
                  <Link href="/contribute">Want to contribute?</Link>
                </Button>
              </div>
            </header>

            {/* Table Section — single table with Dataset column */}
            <div className="flex-1 min-w-0 overflow-auto">
              <FederatedDataTable
                onSearch={() => setIsMapVisible(true)}
                isLoading={isLoading}
                isError={isError}
                data={flattenedData}
                fieldColumns={fieldColumns}
              />
            </div>
          </div>
        ) : (
          /* Search view — form + optional "View results" when we have cached results */
          <div className="flex-1 flex flex-col min-h-0 overflow-auto bg-background animate-in fade-in-0 duration-200" key="search-view">
            {resultKeys.length > 0 && (
              <div className="shrink-0 border-b border-border border-l-4 border-l-primary bg-primary/5 px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Last search
                  {query && (
                    <>: <span className="font-semibold text-primary">&quot;{query}&quot;</span></>
                  )}
                  <span className="font-medium text-foreground ml-1">
                    ({totalResultCount.toLocaleString()} {totalResultCount === 1 ? "record" : "records"})
                  </span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5 shadow-sm"
                  onClick={() => setShowResultsView(true)}
                >
                  <Table2 className="h-4 w-4 shrink-0" />
                  View results
                </Button>
              </div>
            )}
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
              <div className="w-full max-w-2xl mx-auto space-y-10">
                {/* Headline + description */}
                <div className="text-center space-y-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    <span className="text-primary">Explore</span>{" "}
                    <span className="text-foreground">Dataset</span>
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    One query across multiple remote databases. Select categories and datasets in the sidebar, choose indicators below, and get combined results in a single view.
                  </p>
                </div>

                {/* Main search card — highlighted */}
                <div className="relative rounded-2xl bg-card border-2 border-primary/20 shadow-md overflow-hidden ring-1 ring-primary/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" aria-hidden />
                  <div className="p-6 pl-7 space-y-5">
                    <div>
                      <h2 className="text-sm font-medium text-foreground mb-1">
                        Search
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Select indicators and enter your query to search across selected datasets.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Indicators to search
                        </label>
                        <MultiSelectCombobox
                          options={indicatorList}
                          placeholder="Select indicators..."
                          value={indicators}
                          onChange={(val: string[]) => handleIndicatorsChange(val)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Enter search term..."
                          className="flex-1 min-w-0 h-11 rounded-lg bg-background/50 border-border focus-visible:ring-2 focus-visible:ring-primary/20"
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button
                          onClick={handleSearch}
                          disabled={isLoading}
                          className="h-11 px-6 rounded-lg font-medium shadow-sm gap-2"
                        >
                          {isLoading ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Searching…
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4" />
                              Search
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How it works — 1, 2, 3 stacked */}
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/5 to-primary/10 px-5 py-4 shadow-sm ring-1 ring-primary/10">
                  <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                    How it works
                  </h2>
                  <ol className="grid grid-cols-2 gap-3">
                    {[
                      { step: 1, text: "Select datasets from category in the left panel, or pick indicators first — datasets auto-select." },
                      { step: 2, text: "Enter your term and click Search." },
                    ].map(({ step, text }) => (
                      <li key={step} className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm ring-2 ring-primary-foreground/20">
                          {step}
                        </span>
                        <span className="text-sm text-foreground/90 leading-snug pt-1">
                          {text}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
