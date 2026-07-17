"use client";

import React from "react";
import { TableHeader } from "./TableHeader";
import { TableContent } from "./TableContent";
import FederatedDataTable from "@/app/federated_search/components/FederatedDataTable";
import { useMutateFederatedMapSearch } from "@/api/mapSearchApiHandler/MapSearchApiHandler";
import { FederatedMapSearchPayload } from "@/types/api/mapSearch.types";
import { DataItem } from "@/types/api/federatedSearch.types";

export type MapTableViewMode = "split" | "table" | "map";

interface TableSectionProps {
  mode: MapTableViewMode;
  onExpand: () => void;
  onCollapse: () => void;
  title?: string;
  searchPayload?: FederatedMapSearchPayload;
}

export function TableSection({
  mode,
  onExpand,
  onCollapse,
  title,
  searchPayload,
}: TableSectionProps) {
  const {
    data: mapSearchData,
    isLoading,
    isError,
    mutate,
  } = useMutateFederatedMapSearch();

  // Serialized so a re-created payload object does not refire the request
  const payloadKey = searchPayload ? JSON.stringify(searchPayload) : null;

  React.useEffect(() => {
    if (!payloadKey) return;
    mutate(JSON.parse(payloadKey) as FederatedMapSearchPayload);
  }, [payloadKey, mutate]);

  const rows = mapSearchData?.results ?? [];
  const displayFields = mapSearchData?.displayFields ?? {};
  const isEmpty = !isLoading && !isError && rows.length === 0;

  const showContent = mode !== "map";
  const sizing =
    mode === "table"
      ? "flex-1 min-h-0"
      : mode === "split"
      ? "h-1/2 shrink-0"
      : "shrink-0";

  return (
    <div
      className={`flex flex-col overflow-hidden bg-white dark:bg-gray-900 ${sizing}`}
    >
      <TableHeader
        title={title}
        onExpand={onExpand}
        onCollapse={onCollapse}
        canExpand={mode !== "table"}
        canCollapse={mode !== "map"}
        recordCount={rows.length}
      />
      {showContent && (
        <TableContent isEmpty={isEmpty}>
          <FederatedDataTable
            data={rows as DataItem[]}
            fieldColumns={Object.keys(displayFields)}
            columnLabels={displayFields}
            showExploreColumn={false}
            isLoading={isLoading}
            isError={isError}
            embedded={true}
          />
        </TableContent>
      )}
    </div>
  );
}
