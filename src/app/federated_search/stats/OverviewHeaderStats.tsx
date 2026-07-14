"use client";

import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface OverviewHeaderStatsProps {
  query: string;
  selectedDatasetsCount: number;
  datasetsWithResultsCount: number;
  selectedIndicators: string[];
}

export const OverviewHeaderStats: React.FC<OverviewHeaderStatsProps> = ({
  query,
  selectedDatasetsCount,
  datasetsWithResultsCount,
  selectedIndicators,
}) => {
  return (
    <div className="text-xs text-muted-foreground space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span>Search Query:</span>
        <span className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 font-medium text-primary ring-1 ring-primary/20 truncate">
          &quot;{query || "—"}&quot;
        </span>
      </div>

      {selectedIndicators.length > 0 && (
        <div className="flex items-center gap-2">
          <span>Selected Indicators:</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center font-semibold text-foreground cursor-help hover:text-primary transition-colors">
                {selectedIndicators.length} {selectedIndicators.length === 1 ? "indicator" : "indicators"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {selectedIndicators.map((indicator) => (
                  <div key={indicator} className="text-xs py-0.5">
                    • {indicator}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="text-xs">
        <span>Results:</span>
        <span> Found </span>
        <span className="font-semibold text-foreground">{datasetsWithResultsCount}</span>
        <span> of </span>
        <span className="font-semibold text-foreground">{selectedDatasetsCount}</span>
        <span> {selectedDatasetsCount === 1 ? "dataset" : "datasets"} with matching data</span>
      </div>
    </div>
  );
};

export default OverviewHeaderStats;
