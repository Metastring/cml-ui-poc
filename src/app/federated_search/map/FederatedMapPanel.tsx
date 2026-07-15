"use client";

import React from "react";
import { MatchedFieldsMap } from "@/types/api/federatedSearch.types";
import { MapSection } from "./MapSection";
import { TableSection, MapTableViewMode } from "./TableSection";

interface FederatedMapPanelProps {
  datasetGeoserverName?: string;
  mapFields?: MatchedFieldsMap[];
  tableTitle?: string;
  tableChildren?: React.ReactNode;
  isTableEmpty?: boolean;
  recordCount?: number;
}

const MODE_ORDER: MapTableViewMode[] = ["map", "split", "table"];

export function FederatedMapPanel({
  datasetGeoserverName,
  mapFields,
  tableTitle = "Results",
  tableChildren,
  isTableEmpty = true,
  recordCount,
}: FederatedMapPanelProps = {}) {
  const [mode, setMode] = React.useState<MapTableViewMode>("split");

  const stepMode = (direction: 1 | -1) => {
    setMode((prev) => {
      const nextIndex = MODE_ORDER.indexOf(prev) + direction;
      return MODE_ORDER[nextIndex] ?? prev;
    });
  };

  const expandTable = () => stepMode(1);
  const collapseTable = () => stepMode(-1);

  return (
    <div className="h-full w-full flex flex-col relative">
      <MapSection
        datasetGeoserverName={datasetGeoserverName}
        mapFields={mapFields}
        isVisible={mode !== "table"}
      />

      <TableSection
        mode={mode}
        onExpand={expandTable}
        onCollapse={collapseTable}
        title={tableTitle}
        isEmpty={isTableEmpty}
        recordCount={recordCount}
      >
        {tableChildren}
      </TableSection>
    </div>
  );
}
