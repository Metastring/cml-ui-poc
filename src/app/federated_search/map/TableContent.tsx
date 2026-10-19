"use client";

import React from "react";
import { Typography } from "@/components/ui/typography";

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
            <Typography variant="body" weight="medium" className="text-gray-600 dark:text-gray-300">
              No data available
            </Typography>
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-1">
              Select features on the map or apply filters to view results
            </Typography>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
