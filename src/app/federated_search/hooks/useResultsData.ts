import { useMemo } from "react";
import { DataItem, FederatedSearchData } from "@/types/api/federatedSearch.types";

export function useResultsData(
  data: FederatedSearchData | undefined,
  tableDatasetFilter: string
) {
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
      const firstSourceEntry = Object.entries(data.results)[0];
      const derivedFields = firstSourceEntry?.[1]?.field_results
        ? Object.keys(firstSourceEntry[1].field_results)
        : [];
      const fieldColumnsList = apiFields ?? derivedFields;

      Object.entries(data.results).forEach(([datasetKey, source]) => {
        const fieldResults = source?.field_results ?? {};
        const isOccurrenceAvailable = source?.is_occurrence_available ?? false;
        const apiUrl = source?.api_url;
        const rows = Object.entries(fieldResults).flatMap(
          ([, field]) =>
            (field?.results ?? []).map((row) => ({
              ...row,
              dataset: datasetKey,
              is_occurrence_available: isOccurrenceAvailable,
              api_url: apiUrl,
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

  return {
    totalResultCount,
    flattenedData,
    sourcesWithResults,
    sourcesQueried,
    fieldColumns,
  };
}
