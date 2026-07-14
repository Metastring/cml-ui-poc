import { useMemo } from "react";
import {
  useMutatePreFederatedSearch,
  useGetFilterData,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";

export type OverviewStats = {
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
  selectedDatasetsCount: number;
  datasetsWithResultsCount: number;
  selectedIndicators: string[];
};

export function useOverviewStats(): OverviewStats {
  const { query, datasets, indicators } = useFederatedSearchStore();
  const { data: preData } = useMutatePreFederatedSearch();
  const { data: filterData } = useGetFilterData();

  const searchTerm = (preData?.search_text || query).trim();
  const isStreaming = Boolean(preData?.isStreaming);
  const isSearchFinished = Boolean(preData?.isComplete);

  const receivedDatasets = useMemo(
    () => preData?.datasets ?? [],
    [preData?.datasets]
  );

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

  const datasetsWithResults = useMemo(
    () => receivedDatasets.filter((ds) => ds.count > 0).length,
    [receivedDatasets]
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

  const selectedIndicatorsWithLabels = useMemo(
    () =>
      indicators.map(
        (indicator) => indicatorLabelByValue.get(indicator) ?? indicator
      ),
    [indicators, indicatorLabelByValue]
  );

  return {
    searchTerm,
    totalResultCount,
    datasetCount: datasetRows.length,
    expandedCount: 0,
    progressPct,
    checkedCount,
    totalExpected,
    isStreaming,
    isSearchFinished,
    hasOverviewData: datasetRows.length > 0,
    selectedDatasetsCount: totalExpected,
    datasetsWithResultsCount: datasetsWithResults,
    selectedIndicators: selectedIndicatorsWithLabels,
  };
}
