"use client";

import React from "react";
import { TableHeader } from "./TableHeader";
import { TableContent } from "./TableContent";

export type MapTableViewMode = "split" | "table" | "map";

interface TableSectionProps {
  mode: MapTableViewMode;
  onExpand: () => void;
  onCollapse: () => void;
  title?: string;
  children?: React.ReactNode;
  isEmpty?: boolean;
  recordCount?: number;
}

export function TableSection({
  mode,
  onExpand,
  onCollapse,
  title,
  children,
  isEmpty = true,
  recordCount,
}: TableSectionProps) {
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
        recordCount={recordCount}
      />
      {showContent && <TableContent isEmpty={isEmpty}>{children}</TableContent>}
    </div>
  );
}
