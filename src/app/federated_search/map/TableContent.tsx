"use client";

import React from "react";

interface TableContentProps {
  children?: React.ReactNode;
  isEmpty?: boolean;
}

export function TableContent({ children, isEmpty = true }: TableContentProps) {
  return (
    <div className="flex-1 overflow-auto">
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-center p-6">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No data available
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select features on the map or apply filters to view results
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
