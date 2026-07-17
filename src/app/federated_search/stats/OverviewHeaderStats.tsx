"use client";

import React from "react";
import { Leaf } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
          <HoverCard openDelay={100} closeDelay={150}>
            <HoverCardTrigger asChild>
              <span className="inline-flex items-center font-semibold text-foreground cursor-help hover:text-primary transition-colors">
                {selectedIndicators.length} {selectedIndicators.length === 1 ? "indicator" : "indicators"}
              </span>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="start" className="w-64 p-2">
              <p className="px-1 pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Selected indicators
              </p>
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {selectedIndicators.map((indicator) => (
                  <div
                    key={indicator}
                    className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/60"
                  >
                    <Leaf className="h-2.5 w-2.5 shrink-0 text-primary/60" />
                    <span className="min-w-0 flex-1 truncate text-[11px]" title={indicator}>
                      {indicator}
                    </span>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
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
