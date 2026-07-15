"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TableHeaderProps {
  title?: string;
  onExpand: () => void;
  onCollapse: () => void;
  canExpand: boolean;
  canCollapse: boolean;
  recordCount?: number;
}

export function TableHeader({
  title = "Results",
  onExpand,
  onCollapse,
  canExpand,
  canCollapse,
  recordCount,
}: TableHeaderProps) {
  const buttonClass =
    "flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h2>
        {typeof recordCount === "number" && (
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
            {`${recordCount.toLocaleString()} ${
              recordCount === 1 ? "record" : "records"
            }`}
          </span>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onExpand}
          disabled={!canExpand}
          title="Expand table"
          className={buttonClass}
        >
          <ChevronUp size={16} />
          Expand
        </button>
        <button
          onClick={onCollapse}
          disabled={!canCollapse}
          title="Collapse table"
          className={buttonClass}
        >
          <ChevronDown size={16} />
          Collapse
        </button>
      </div>
    </div>
  );
}
