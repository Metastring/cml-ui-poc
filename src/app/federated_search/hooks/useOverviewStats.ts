import { useMemo } from "react";
import {
  useMutatePreFederatedSearch,
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
};

export function useOverviewStats(): OverviewStats {
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
    expandedCount: 0,
    progressPct,
    checkedCount,
    totalExpected,
    isStreaming,
    isSearchFinished,
    hasOverviewData: datasetRows.length > 0,
  };
}
