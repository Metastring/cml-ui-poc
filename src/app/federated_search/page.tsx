"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FederatedSearchBar from "@/app/federated_search/FederatedSearchBar";
import FederatedSearchOverview, {
  FederatedSearchOverviewStats,
  useOverviewStats,
} from "@/app/federated_search/FederatedSearchOverview";
import {
  AlertCircle,
  Check,
  Database,
  Globe2,
  Leaf,
  ListFilter,
  LocateFixed,
  LocateOff,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  TextSearch,
} from "lucide-react";
import InstructionPopover from "@/element/popover/InstructionPopover";
import BaseMap from "@/components/map/BaseMap";
import AddMarker from "@/components/mapFeatures/addMarker/AddMarker";
import {
  useGetFilterData,
  useMutateFederatedSearch,
  useMutatePreFederatedSearch,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import FederatedDataTable from "./FederatedDataTable";
import useFederatedSearchMapData from "@/store/federated_search_store/useFederatedSearchMapData";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import { Option } from "@/types/app/federatedSearch.types";
import { DataItem } from "@/types/api/federatedSearch.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SEARCH_TRANSITION_MS = 1100;
const SLIDE_TRANSITION =
  "transition-all duration-[1100ms] ease-in-out";

type SearchLayoutMode = "landing" | "transitioning" | "results";

function resolveInitialLayoutMode(
  preSearchActive: boolean,
  openTable: boolean
): SearchLayoutMode {
  if (preSearchActive || openTable) return "results";
  return "landing";
}

function BiodiversitySearchBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute -left-8 top-16 h-32 w-32 text-primary/8
          rotate-[-18deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <svg
        className="absolute right-8 top-8 h-24 w-24 text-accent/20
          rotate-[12deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <svg
        className="absolute bottom-12 left-1/4 h-20 w-20 text-primary/6
          rotate-[8deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <svg
        className="absolute -right-4 bottom-20 h-28 w-28 text-accent/12
          rotate-[-25deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

const FederatedSearchContent = () => {
  const searchParams = useSearchParams();
  const [isMapVisible, setIsMapVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { selectedCoordinates, visibleMarkers } = useFederatedSearchMapData();
  const {
    categories,
    datasets,
    indicators,
    query,
    setQuery,
    setIndicators,
    setCategories,
    setDatasets,
  } = useFederatedSearchStore();
  const {
    data: filterData,
    isLoading: isFilterLoading,
    isError: isFilterError,
    refetch: refetchFilter,
  } = useGetFilterData();
  const {
    data,
    isError,
    mutate,
    isMutating: isLoading,
  } = useMutateFederatedSearch();
  const {
    data: preData,
    mutate: mutatePre,
    isMutating: isPreLoading,
    isError: isPreSearchError,
    reset: resetPreSearch,
  } = useMutatePreFederatedSearch();
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const overviewStats = useOverviewStats();
  const hasActiveSearch = Boolean(
    preData?.isStreaming ||
      preData?.isComplete ||
      preData?.search_text
  );

  const [showOverview, setShowOverview] = useState(
    () =>
      Boolean(
        preData?.isStreaming ||
          preData?.isComplete ||
          preData?.datasets?.length
      )
  );

  const [layoutMode, setLayoutMode] = useState<SearchLayoutMode>(() =>
    resolveInitialLayoutMode(
      Boolean(
        preData?.isStreaming ||
          preData?.isComplete ||
          preData?.search_text
      ),
      searchParams?.get("table") === "1"
    )
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(query);

  const resultKeys = Object.keys(data?.results || {});
  const [showResultsView, setShowResultsView] = useState(
    () => searchParams?.get("table") === "1"
  );
  const tableDatasetFilter = searchParams?.get("dataset") ?? "";

  const { totalResultCount, flattenedData, sourcesWithResults, sourcesQueried, fieldColumns } =
    useMemo(() => {
      if (!data?.results) {
        return {
          totalResultCount: 0,
          flattenedData: [] as DataItem[],
          sourcesWithResults: 0,
          sourcesQueried: 0,
          fieldColumns: [] as string[],
        };
      }
      const keys = Object.keys(data.results);
      const flattened: DataItem[] = [];
      let sourcesWithResultsCount = 0;
      const apiFields =
        data.fields && data.fields.length > 0 ? data.fields : null;
      const firstSource = Object.values(data.results)[0];
      const derivedFields = firstSource?.field_results
        ? Object.keys(firstSource.field_results)
        : [];
      const fieldColumnsList = apiFields ?? derivedFields;

      Object.entries(data.results).forEach(([datasetKey, source]) => {
        const fieldResults = source?.field_results ?? {};
        const isOccurrenceAvailable = source?.is_occurrence_available ?? false;
        const rows = Object.values(fieldResults).flatMap(
          (field: { results?: DataItem[] }) =>
            (field?.results ?? []).map((row) => ({
              ...row,
              dataset: datasetKey,
              is_occurrence_available: isOccurrenceAvailable,
            }))
        );
        if (rows.length > 0) sourcesWithResultsCount += 1;
        flattened.push(...rows);
      });
      const filtered = tableDatasetFilter
        ? flattened.filter((row) => row.dataset === tableDatasetFilter)
        : flattened;

      return {
        totalResultCount: filtered.length,
        flattenedData: filtered,
        sourcesWithResults: sourcesWithResultsCount,
        sourcesQueried: keys.length,
        fieldColumns: fieldColumnsList,
      };
    }, [data?.results, data?.fields, tableDatasetFilter]);

  const indicatorList: Option[] = useMemo(() => {
    if (!filterData) return [];
    const seen = new Set<string>();
    const options: Option[] = [];
    filterData.forEach((category) => {
      category.datasets?.forEach((ds) => {
        (
          (ds as {
            fields?: {
              ontology_mapping_to_display?: string;
              ontology_mapping: string;
            }[];
          }).fields ?? []
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

  const fieldToSources = useMemo(() => {
    const map = new Map<string, { categories: string[]; datasets: string[] }>();
    if (!filterData) return map;
    filterData.forEach((category) => {
      category.datasets?.forEach((ds) => {
        const dsTitle = ds.dataset_title;
        const fields =
          (ds as { fields?: { ontology_mapping: string }[] }).fields ?? [];
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

  const isSearchLanding = layoutMode === "landing";
  const isSearchTransitioning = layoutMode === "transitioning";
  const showResultsPanel = layoutMode === "results";
  const isFormBusy =
    isPreLoading || isSearchTransitioning || isFilterLoading;
  const indicatorsReady =
    !isFilterLoading && !isFilterError && indicatorList.length > 0;
  const hasDatasets = datasets.length > 0;
  const hasIndicators = indicators.length > 0;
  const hasSearchTerm = searchDraft.trim().length > 0;
  const isSearchReady =
    hasDatasets &&
    hasIndicators &&
    hasSearchTerm &&
    indicatorsReady &&
    !isFormBusy;

  const selectedIndicatorLabels = useMemo(() => {
    const labelByValue = new Map(
      indicatorList.map((option) => [option.value, option.label])
    );
    return indicators.map((value) => labelByValue.get(value) ?? value);
  }, [indicators, indicatorList]);

  const returnToLanding = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setLayoutMode("landing");
  }, []);

  const beginResultsTransition = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    setLayoutMode("transitioning");
    transitionTimerRef.current = setTimeout(() => {
      setLayoutMode("results");
      transitionTimerRef.current = null;
    }, SEARCH_TRANSITION_MS);
  }, []);

  const handleSearch = () => {
    const inputValue = searchInputRef.current?.value.trim() ?? "";
    if (isFilterLoading) {
      return toast.error("Indicators are still loading. Please wait.");
    }
    if (isFilterError) {
      return toast.error("Could not load indicators. Please retry.");
    }
    if (!indicatorList.length) {
      return toast.error("No indicators available to search.");
    }
    if (!categories.length) return toast.error("Please select a category.");
    if (!datasets.length) return toast.error("Please select a dataset.");
    if (!indicators.length) {
      return toast.error("Please select at least one indicator.");
    }
    if (!inputValue) return toast.error("Please enter a search term.");
    setSearchError(null);
    resetPreSearch();
    setQuery(inputValue);
    setShowOverview(true);
    setShowResultsView(false);
    beginResultsTransition();
    mutatePre({
      category: categories,
      dataset: datasets,
      search_text: inputValue,
      fields: indicators,
    });
  };

  const handleSearchComplete = useCallback(
    (hasResults: boolean) => {
      if (preData?.hasError || isPreSearchError) return;
      if (!hasResults) {
        toast.error("No results found for your search.");
        setShowOverview(false);
        returnToLanding();
      }
    },
    [isPreSearchError, preData?.hasError, returnToLanding]
  );

  const handleNewSearch = useCallback(() => {
    setSearchError(null);
    resetPreSearch();
    setShowOverview(false);
    returnToLanding();
  }, [resetPreSearch, returnToLanding]);

  useEffect(() => {
    if (searchParams?.get("table") === "1" && resultKeys.length > 0) {
      setShowResultsView(true);
    }
    if (!resultKeys.length) setShowResultsView(false);
    if (searchParams?.get("map") === "1") setIsMapVisible(true);
  }, [searchParams, resultKeys.length]);

  useEffect(() => {
    if (query && searchInputRef.current) {
      searchInputRef.current.value = query;
      setSearchDraft(query);
    }
  }, [query]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!preData?.hasError) return;
    setSearchError(
      preData.errorMessage ??
        "Search failed. Please check your connection and try again."
    );
    setShowOverview(false);
    returnToLanding();
  }, [preData?.hasError, preData?.errorMessage, returnToLanding]);

  return (
    <div className="h-screen flex">
      <div
        className="w-[350px] shrink-0 border-r border-border bg-card
          flex flex-col min-h-0 overflow-hidden"
      >
        <header className="shrink-0 border-b border-border bg-muted/20">
          <div
            className="flex flex-nowrap items-center justify-between gap-2
              px-3 py-2.5 min-h-[40px]"
          >
            <InstructionPopover
              title="Explore Datasets"
              icon={<Search className="h-4 w-4" />}
            >
              <p>
                Explore Datasets queries multiple remote databases and returns
                unified results in a single view.
              </p>
            </InstructionPopover>
            {isMapVisible ? (
              <button
                type="button"
                title="Hide Map"
                onClick={() => setIsMapVisible(false)}
                className="shrink-0 inline-flex items-center gap-1.5
                  rounded-md px-2 py-1.5 text-xs font-medium bg-primary
                  text-primary-foreground shadow-sm transition-colors
                  hover:bg-primary/90"
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
                className="shrink-0 inline-flex items-center gap-1.5
                  rounded-md px-2 py-1.5 text-xs font-medium
                  text-muted-foreground hover:bg-muted hover:text-foreground
                  transition-colors"
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className={cn(
            "overflow-hidden shadow-lg duration-[1100ms] ease-in-out",
            SLIDE_TRANSITION,
            isMapVisible ? "h-[50vh]" : "h-0"
          )}
        >
          {isMapVisible && (
            <div className="h-full w-full">
              <BaseMap />
              <AddMarker
                markers={visibleMarkers}
                flyTo={selectedCoordinates}
              />
            </div>
          )}
        </div>

        {resultKeys.length > 0 && showResultsView ? (
          <div
            className="flex-1 flex flex-col min-h-0 overflow-hidden
              animate-in fade-in-0 duration-200"
            key="results-view"
          >
            <header
              className="shrink-0 border-b border-border border-l-4
                border-l-primary bg-primary/5 flex flex-wrap items-center
                justify-between gap-3 px-4 py-2.5"
              role="region"
              aria-label="Results summary"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-7 text-xs font-medium"
                  onClick={() => {
                    setShowResultsView(false);
                    setLayoutMode("results");
                  }}
                >
                  ← Back to datasets
                </Button>
                <span className="text-sm text-foreground flex items-center gap-2 flex-wrap" aria-live="polite">
                  <span>Results for</span>
                  <span
                    className="inline-flex items-center rounded-md bg-primary/15
                      px-2 py-0.5 font-semibold text-primary ring-1 ring-primary/20"
                  >
                    &quot;{query || "—"}&quot;
                  </span>
                  <span>
                    <strong className="font-semibold text-foreground">
                      {totalResultCount.toLocaleString()}
                    </strong>{" "}
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
                  className="h-7 text-xs font-medium gap-1.5 bg-primary
                    text-primary-foreground shadow-md ring-2 ring-primary/30
                    hover:bg-primary/90"
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
            </header>

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
          <div
            className="flex-1 flex flex-col min-h-0 overflow-hidden
              bg-background"
            key="search-view"
          >
            <section
              className={cn(
                "shrink-0 relative overflow-hidden",
                SLIDE_TRANSITION,
                isSearchLanding
                  ? "federated-search-landing-bg flex flex-1 items-center " +
                      "justify-center px-4 py-10 sm:px-8 sm:py-14"
                  : "border-b border-border/80 bg-card/95 backdrop-blur-md " +
                      "px-4 py-3 shadow-sm"
              )}
            >
              {isSearchLanding && <BiodiversitySearchBackdrop />}

              <div
                className={cn(
                  "w-full relative z-[1]",
                  SLIDE_TRANSITION,
                  isSearchLanding
                    ? "max-w-3xl space-y-7"
                    : "space-y-2"
                )}
              >
                {isSearchLanding && (
                  <div
                    className="text-center space-y-5 animate-in fade-in-0
                      slide-in-from-bottom-2 duration-[1100ms]"
                  >
                    <div className="relative mx-auto w-fit">
                      <div
                        className="absolute inset-0 rounded-full bg-primary/25
                          blur-2xl scale-125"
                      />
                      <div
                        className="relative flex h-[5.5rem] w-[5.5rem]
                          items-center justify-center rounded-full
                          bg-gradient-to-br from-primary/25 via-primary/10
                          to-accent/20 ring-2 ring-primary/20 shadow-xl"
                      >
                        <Globe2
                          className="absolute h-10 w-10 text-primary/25"
                        />
                        <Search className="relative h-9 w-9 text-primary" />
                        <Leaf
                          className="absolute -right-1 -top-1 h-5 w-5
                            text-primary/70 rotate-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2
                        className="text-2xl sm:text-[2rem] font-semibold
                          tracking-tight text-foreground leading-tight"
                      >
                        Explore Datasets
                      </h2>
                      <p
                        className="text-sm sm:text-[0.925rem]
                          text-muted-foreground max-w-xl mx-auto
                          leading-relaxed"
                      >
                        Discover species occurrences, taxonomy, and
                        ecological records across connected biodiversity
                        databases — one search, many sources.
                      </p>
                    </div>
                    <div
                      className="flex flex-wrap items-center justify-center
                        gap-2 text-[11px]"
                    >
                      {[
                        {
                          step: 1,
                          label: "Datasets",
                          done: hasDatasets,
                          active: !hasDatasets,
                          icon: Database,
                        },
                        {
                          step: 2,
                          label: "Indicators",
                          done: hasIndicators,
                          active: hasDatasets && !hasIndicators,
                          icon: ListFilter,
                        },
                        {
                          step: 3,
                          label: "Search",
                          done: hasSearchTerm,
                          active: hasIndicators && !hasSearchTerm,
                          icon: TextSearch,
                        },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <React.Fragment key={item.label}>
                            {index > 0 && (
                              <Leaf
                                className={cn(
                                  "hidden sm:inline h-3 w-3 rotate-90",
                                  "text-primary/25",
                                  item.done && "text-emerald-500/40"
                                )}
                              />
                            )}
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full",
                                "px-3 py-1.5 ring-1 transition-colors",
                                item.done &&
                                  "bg-emerald-500/10 text-emerald-700 " +
                                    "ring-emerald-500/25 " +
                                    "dark:text-emerald-400",
                                item.active &&
                                  !item.done &&
                                  "bg-primary/10 text-primary " +
                                    "ring-primary/25 shadow-sm",
                                !item.done &&
                                  !item.active &&
                                  "bg-muted/50 text-muted-foreground " +
                                    "ring-border/60"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center",
                                  "rounded-full text-[10px] font-semibold",
                                  item.done && "bg-emerald-500/15",
                                  item.active &&
                                    !item.done &&
                                    "bg-primary/15",
                                  !item.done &&
                                    !item.active &&
                                    "bg-muted"
                                )}
                              >
                                {item.done ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  item.step
                                )}
                              </span>
                              <Icon className="h-3 w-3 shrink-0 opacity-70" />
                              {item.label}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isSearchLanding && isFilterLoading && (
                  <div
                    className="flex items-center justify-center gap-2
                      rounded-xl border border-dashed border-primary/20
                      bg-primary/[0.03] px-4 py-3 text-sm
                      text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Loading indicators…
                  </div>
                )}

                {isSearchLanding && isFilterError && (
                  <div
                    className="rounded-lg border border-destructive/30
                      bg-destructive/5 px-4 py-3 space-y-2"
                    role="alert"
                  >
                    <div
                      className="flex items-start gap-2 text-sm
                        text-destructive"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>
                        Could not load indicators. Check your connection
                        and try again.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => refetchFilter()}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                  </div>
                )}

                {isSearchLanding &&
                  !isFilterLoading &&
                  !isFilterError &&
                  indicatorList.length === 0 && (
                    <div
                      className="rounded-lg border border-dashed border-border
                        bg-muted/15 px-4 py-3 text-sm text-muted-foreground
                        text-center"
                      role="status"
                    >
                      No indicators available for the selected datasets.
                    </div>
                  )}

                {isSearchLanding && searchError && (
                  <div
                    className="rounded-lg border border-destructive/30
                      bg-destructive/5 px-4 py-3 flex items-start gap-2
                      text-sm text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{searchError}</p>
                  </div>
                )}

                <div
                  className={cn(
                    SLIDE_TRANSITION,
                    "relative overflow-hidden",
                    isSearchLanding
                      ? "federated-search-specimen-card rounded-2xl " +
                          "p-0 sm:p-0 space-y-0 backdrop-blur-md"
                      : "flex flex-wrap items-center gap-2 rounded-xl " +
                          "border border-primary/15 bg-gradient-to-r " +
                          "from-primary/[0.04] via-card to-accent/[0.06] " +
                          "p-2 shadow-md ring-1 ring-primary/10"
                  )}
                >
                  {isSearchLanding && (
                    <>
                      <div
                        className="federated-search-canopy-line h-1"
                        aria-hidden
                      />
                      <div
                        className="border-b border-primary/10 bg-primary/[0.04]
                          px-5 py-3.5 sm:px-6"
                      >
                        <div
                          className="flex items-center gap-2 text-[11px]
                            font-medium uppercase tracking-[0.14em]
                            text-primary/80"
                        >
                          <Leaf className="h-3.5 w-3.5" />
                          Field query
                        </div>
                        <p
                          className="mt-1 text-xs text-muted-foreground"
                        >
                          Species · taxonomy · occurrence records
                        </p>
                      </div>
                    </>
                  )}

                  <div
                    className={cn(
                      isSearchLanding
                        ? "space-y-4 p-5 sm:p-6"
                        : "contents"
                    )}
                  >
                  <div
                    className={cn(
                      isSearchLanding
                        ? "grid gap-4 lg:grid-cols-2 lg:gap-5"
                        : "contents"
                    )}
                  >
                  <div
                    className={cn(
                      isSearchLanding
                        ? "federated-search-field-panel rounded-xl " +
                            "border border-primary/10 p-4 space-y-3"
                        : "flex min-w-0 items-center gap-2 sm:min-w-[220px]",
                      isFormBusy && "pointer-events-none opacity-60"
                    )}
                  >
                    {isSearchLanding ? (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center
                            justify-center rounded-xl bg-primary/12
                            text-primary ring-1 ring-primary/20 shadow-sm"
                        >
                          <ListFilter className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div
                            className="flex flex-wrap items-center gap-2"
                          >
                            <p className="text-sm font-semibold">
                              Indicators
                            </p>
                            {indicators.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-[10px]
                                  bg-emerald-500/12 text-emerald-700
                                  hover:bg-emerald-500/12
                                  ring-1 ring-emerald-500/20
                                  dark:text-emerald-400"
                              >
                                {indicators.length} selected
                              </Badge>
                            )}
                          </div>
                          <p
                            className="text-[11px] text-muted-foreground
                              leading-snug"
                          >
                            Choose taxonomic and ecological fields to
                            search across your datasets.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="hidden sm:flex h-8 w-8 shrink-0
                          items-center justify-center rounded-lg
                          bg-primary/8 text-primary ring-1 ring-primary/15"
                        title="Indicators"
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <MultiSelectCombobox
                      options={indicatorList}
                      placeholder={
                        isFilterLoading
                          ? "Loading indicators…"
                          : "Select indicators..."
                      }
                      value={indicators}
                      onChange={(val: string[]) =>
                        handleIndicatorsChange(val)
                      }
                      className={cn(
                        "min-w-0",
                        isSearchLanding
                          ? "w-full h-11 bg-background/90 shadow-sm " +
                              "ring-1 ring-primary/10"
                          : "w-full sm:w-64 md:w-72 h-8"
                      )}
                    />
                    {isSearchLanding && selectedIndicatorLabels.length > 0 && (
                      <div
                        className="flex flex-wrap gap-1.5 border-t
                          border-primary/8 pt-3"
                      >
                        {selectedIndicatorLabels.slice(0, 4).map((label) => (
                          <span
                            key={label}
                            className="inline-flex max-w-[10rem] items-center
                              gap-1 truncate rounded-full bg-primary/8
                              px-2.5 py-1 text-[10px] font-medium
                              text-primary ring-1 ring-primary/15"
                            title={label}
                          >
                            <Leaf className="h-2.5 w-2.5 shrink-0 opacity-60" />
                            {label}
                          </span>
                        ))}
                        {selectedIndicatorLabels.length > 4 && (
                          <span
                            className="inline-flex rounded-full bg-muted/80
                              px-2.5 py-1 text-[10px] text-muted-foreground
                              ring-1 ring-border/60"
                          >
                            +{selectedIndicatorLabels.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isSearchLanding ? (
                    <div
                      className="federated-search-field-panel rounded-xl
                        border border-primary/10 p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center
                            justify-center rounded-xl bg-primary/12
                            text-primary ring-1 ring-primary/20 shadow-sm"
                        >
                          <TextSearch className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            Search term
                          </p>
                          <p
                            className="text-[11px] text-muted-foreground
                              leading-snug"
                          >
                            Scientific name, vernacular name, or any
                            biodiversity keyword.
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-xl ring-1",
                          "ring-primary/15 bg-background/90",
                          "focus-within:ring-2 focus-within:ring-primary/30",
                          "transition-all shadow-inner",
                          isFormBusy && "pointer-events-none opacity-60"
                        )}
                      >
                        <div
                          className="pointer-events-none absolute inset-y-0
                            left-0 w-1 bg-gradient-to-b from-primary/40
                            to-accent/40"
                          aria-hidden
                        />
                        <Search
                          className="pointer-events-none absolute left-4
                            top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50"
                        />
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="e.g. Panthera leo, Quercus robur…"
                          defaultValue={query}
                          disabled={isFormBusy || !indicatorsReady}
                          className="h-12 w-full border-0 pl-11 text-sm
                            bg-transparent shadow-none focus-visible:ring-0"
                          onChange={(e) => setSearchDraft(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && !isFormBusy && handleSearch()
                          }
                        />
                      </div>
                      <div
                        className="flex items-center justify-between gap-2
                          text-[10px] text-muted-foreground/80"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Leaf className="h-3 w-3 opacity-50" />
                          Press Enter to search
                        </span>
                        {hasSearchTerm && (
                          <span
                            className="tabular-nums font-medium
                              text-primary/70"
                          >
                            {searchDraft.trim().length} chars
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="hidden sm:block h-8 w-px shrink-0
                          bg-border/80"
                        aria-hidden
                      />
                      <div
                        className={cn(
                          "relative flex-1 min-w-[160px]",
                          isFormBusy && "pointer-events-none opacity-60"
                        )}
                      >
                        <Search
                          className="pointer-events-none absolute left-2.5
                            top-1/2 h-3.5 w-3.5 -translate-y-1/2
                            text-muted-foreground"
                        />
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search term…"
                          defaultValue={query}
                          disabled={isFormBusy || !indicatorsReady}
                          className="h-8 w-full pl-8 text-sm bg-background
                            border-border/60 shadow-none
                            focus-visible:ring-primary/25"
                          onChange={(e) => setSearchDraft(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && !isFormBusy && handleSearch()
                          }
                        />
                      </div>
                    </>
                  )}
                  </div>

                  {isSearchLanding && (
                    <div
                      className="grid grid-cols-3 gap-2 rounded-xl
                        border border-primary/10 bg-primary/[0.03] p-3
                        ring-1 ring-primary/5"
                    >
                      {[
                        {
                          label: "Datasets",
                          ok: hasDatasets,
                          detail: hasDatasets
                            ? `${datasets.length} selected`
                            : "Select in sidebar",
                        },
                        {
                          label: "Indicators",
                          ok: hasIndicators,
                          detail: hasIndicators
                            ? `${indicators.length} selected`
                            : "Pick at least one",
                        },
                        {
                          label: "Search term",
                          ok: hasSearchTerm,
                          detail: hasSearchTerm ? "Ready" : "Type to search",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cn(
                            "rounded-lg px-2 py-1.5 text-center",
                            item.ok
                              ? "bg-emerald-500/8 ring-1 ring-emerald-500/20"
                              : "bg-background/60 ring-1 ring-border/50"
                          )}
                        >
                          <div
                            className="flex items-center justify-center gap-1
                              text-[10px] font-medium"
                          >
                            {item.ok ? (
                              <Check
                                className="h-3 w-3 text-emerald-600
                                  dark:text-emerald-400"
                              />
                            ) : (
                              <span
                                className="h-1.5 w-1.5 rounded-full
                                  bg-muted-foreground/40"
                              />
                            )}
                            {item.label}
                          </div>
                          <p
                            className="mt-0.5 truncate text-[9px]
                              text-muted-foreground"
                          >
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={cn(
                      isSearchLanding
                        ? "pt-0.5"
                        : "flex shrink-0 items-center gap-1.5"
                    )}
                  >
                    <Button
                      onClick={handleSearch}
                      disabled={isFormBusy || !indicatorsReady}
                      size={isSearchLanding ? "default" : "sm"}
                      className={cn(
                        "gap-1.5 shrink-0 font-semibold transition-all",
                        isSearchLanding
                          ? "h-12 w-full shadow-lg bg-primary " +
                              "hover:bg-primary/90"
                          : "h-8 px-4 shadow-sm",
                        isSearchReady &&
                          isSearchLanding &&
                          "ring-2 ring-primary/40 shadow-lg " +
                            "shadow-primary/25"
                      )}
                    >
                      {isPreLoading || isSearchTransitioning ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {isSearchTransitioning
                            ? "Preparing…"
                            : "Searching…"}
                        </>
                      ) : (
                        <>
                          <Search
                            className={cn(
                              isSearchLanding ? "h-4 w-4" : "h-3.5 w-3.5"
                            )}
                          />
                          Search
                        </>
                      )}
                    </Button>

                    {!isSearchLanding && showResultsPanel && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs text-muted-foreground
                          hover:bg-background hover:text-foreground"
                        onClick={handleNewSearch}
                        disabled={isPreLoading}
                      >
                        New search
                      </Button>
                    )}
                  </div>
                  </div>
                </div>

                {isSearchLanding &&
                  (categories.length > 0 ||
                    datasets.length > 0 ||
                    indicators.length > 0) && (
                    <div
                      className="rounded-2xl border border-primary/12
                        bg-card/80 px-5 py-4 shadow-sm ring-1
                        ring-primary/8 backdrop-blur-sm animate-in
                        fade-in-0 duration-300"
                    >
                      <p
                        className="mb-3 flex items-center justify-center
                          gap-1.5 text-[10px] font-semibold uppercase
                          tracking-[0.12em] text-primary/70"
                      >
                        <Globe2 className="h-3 w-3" />
                        Your selection
                      </p>
                      <div
                        className="flex flex-wrap items-center
                          justify-center gap-2"
                      >
                        {categories.length > 0 && (
                          <Badge
                            variant="outline"
                            className="h-6 gap-1 px-2.5 text-[11px]
                              font-normal"
                          >
                            <Database className="h-3 w-3 opacity-60" />
                            {categories.length}{" "}
                            {categories.length === 1
                              ? "category"
                              : "categories"}
                          </Badge>
                        )}
                        {datasets.length > 0 && (
                          <Badge
                            className="h-6 gap-1 px-2.5 text-[11px]
                              bg-primary/10 text-primary hover:bg-primary/10
                              ring-1 ring-primary/20"
                          >
                            {datasets.length}{" "}
                            {datasets.length === 1 ? "dataset" : "datasets"}
                          </Badge>
                        )}
                        {indicators.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-6 gap-1 px-2.5 text-[11px]
                              font-normal"
                          >
                            <ListFilter className="h-3 w-3 opacity-60" />
                            {indicators.length}{" "}
                            {indicators.length === 1
                              ? "indicator"
                              : "indicators"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                {!isSearchLanding && (
                  <div className="space-y-1.5">
                    {showResultsPanel && query && (
                      <div
                        className="flex flex-wrap items-center gap-2 text-[11px]
                          text-muted-foreground rounded-lg bg-primary/[0.04]
                          border border-primary/10 px-3 py-2"
                      >
                        <Leaf className="h-3 w-3 text-primary/50 shrink-0" />
                        <span className="font-medium text-primary/80">
                          Active query
                        </span>
                        <span
                          className="inline-flex items-center rounded-md
                            bg-primary/10 px-2 py-0.5 font-medium text-primary
                            ring-1 ring-primary/15"
                        >
                          &quot;{query}&quot;
                        </span>
                        {hasIndicators && (
                          <span className="tabular-nums">
                            · {indicators.length} indicator
                            {indicators.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    )}
                    {showResultsPanel &&
                      showOverview &&
                      hasActiveSearch &&
                      !preData?.hasError && (
                        <FederatedSearchOverviewStats
                          stats={{ ...overviewStats, expandedCount: 0 }}
                        />
                      )}
                  </div>
                )}
              </div>
            </section>

            {(isSearchTransitioning || showResultsPanel) && (
              <div
                className={cn(
                  "flex-1 min-h-0 overflow-auto p-2",
                  showResultsPanel &&
                    "animate-in fade-in-0 slide-in-from-bottom-6 " +
                      "duration-[1100ms] ease-in-out"
                )}
                aria-busy={
                  isSearchTransitioning ||
                  isPreLoading ||
                  overviewStats.isStreaming
                }
              >
                {isSearchTransitioning && (
                  <div
                    className="flex h-full min-h-[200px] flex-col items-center
                      justify-center gap-3 text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2
                      className="h-8 w-8 animate-spin text-primary"
                    />
                    <p className="text-sm">Preparing results view…</p>
                  </div>
                )}

                {showResultsPanel && preData?.hasError && (
                  <div
                    className="flex h-full min-h-[200px] flex-col items-center
                      justify-center gap-3 px-6 text-center"
                    role="alert"
                  >
                    <AlertCircle
                      className="h-10 w-10 text-destructive"
                    />
                    <p className="text-sm text-destructive max-w-md">
                      {preData.errorMessage ??
                        "Search failed. Please try again."}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={handleNewSearch}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Try again
                    </Button>
                  </div>
                )}

                {showResultsPanel &&
                  !preData?.hasError &&
                  isPreLoading &&
                  !preData?.datasets?.length && (
                    <div
                      className="flex h-full min-h-[200px] flex-col items-center
                        justify-center gap-3 text-muted-foreground"
                      role="status"
                      aria-live="polite"
                    >
                      <Loader2
                        className="h-8 w-8 animate-spin text-primary"
                      />
                      <p className="text-sm">
                        Querying {datasets.length}{" "}
                        {datasets.length === 1 ? "dataset" : "datasets"}…
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        Results will appear as each source responds.
                      </p>
                    </div>
                  )}

                {showResultsPanel &&
                  !preData?.hasError &&
                  showOverview &&
                  hasActiveSearch &&
                  (preData?.datasets?.length || !isPreLoading) && (
                    <FederatedSearchOverview
                      onSearchComplete={handleSearchComplete}
                    />
                  )}

                {showResultsPanel &&
                  !preData?.hasError &&
                  !showOverview &&
                  !isPreLoading && (
                    <p
                      className="text-center text-xs text-muted-foreground
                        py-8"
                    >
                      Select datasets in the sidebar, pick indicators,
                      and search.
                    </p>
                  )}
              </div>
            )}
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
