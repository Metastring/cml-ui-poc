import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  useGetFilterData,
  useMutateFederatedSearch,
  useMutatePreFederatedSearch,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { Option } from "@/types/app/federatedSearch.types";
import { DatasetOverviewRow } from "@/app/federated_search/components/FederatedSearchOverview";

type SearchLayoutMode = "landing" | "transitioning" | "results";

function resolveInitialLayoutMode(
  preSearchActive: boolean,
  openTable: boolean
): SearchLayoutMode {
  if (preSearchActive || openTable) return "results";
  return "landing";
}

export function useSearchLogic() {
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    reset: resetPreSearch,
  } = useMutatePreFederatedSearch();

  const hasActiveSearch = Boolean(
    preData?.isStreaming || preData?.isComplete || preData?.search_text
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
  const [isToggleActive, setIsToggleActive] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const resultKeys = Object.keys(data?.results || {});
  const [showResultsView, setShowResultsView] = useState(
    () => searchParams?.get("table") === "1"
  );
  const [selectedDataset, setSelectedDataset] = useState<DatasetOverviewRow | null>(null);

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

  const selectedIndicatorLabels = useMemo(() => {
    const labelByValue = new Map(
      indicatorList.map((option) => [option.value, option.label])
    );
    return indicators.map((value) => labelByValue.get(value) ?? value);
  }, [indicators, indicatorList]);

  const returnToLanding = useCallback(() => {
    setLayoutMode("landing");
  }, []);

  const beginResultsTransition = useCallback(() => {
    setLayoutMode("results");
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
    if (showResultsView && resultKeys.length > 0) {
      setIsToggleActive(true);
    }
  }, [showResultsView, resultKeys]);

  useEffect(() => {
    if (!preData?.hasError) return;
    setSearchError(
      preData.errorMessage ??
        "Search failed. Please check your connection and try again."
    );
    setShowOverview(false);
    returnToLanding();
  }, [preData?.hasError, preData?.errorMessage, returnToLanding]);

  return {
    searchInputRef,
    isMapVisible,
    setIsMapVisible,
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
  };
}
