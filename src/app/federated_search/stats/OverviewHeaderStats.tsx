"use client";

import React from "react";
import { Leaf } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Typography } from "@/components/ui/typography";

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
        <Typography variant="inherit" as="span" tone="primary" weight="medium" truncate className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 ring-1 ring-primary/20">
          &quot;{query || "—"}&quot;
        </Typography>
      </div>

      {selectedIndicators.length > 0 && (
        <div className="flex items-center gap-2">
          <span>Selected Indicators:</span>
          <HoverCard openDelay={100} closeDelay={150}>
            <HoverCardTrigger asChild>
              <Typography variant="inherit" as="span" tone="default" weight="semibold" className="inline-flex items-center cursor-help hover:text-primary transition-colors">
                {selectedIndicators.length} {selectedIndicators.length === 1 ? "indicator" : "indicators"}
              </Typography>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="start" className="w-64 p-2">
              <Typography variant="body" tone="muted" weight="medium" className="px-1 pb-1.5 text-micro uppercase tracking-[0.12em]">
                Selected indicators
              </Typography>
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {selectedIndicators.map((indicator) => (
                  <div
                    key={indicator}
                    className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/60"
                  >
                    <Leaf className="h-2.5 w-2.5 shrink-0 text-primary/60" />
                    <Typography variant="caption" truncate className="min-w-0 flex-1" title={indicator}>
                      {indicator}
                    </Typography>
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
        <Typography variant="inherit" as="span" tone="default" weight="semibold">{datasetsWithResultsCount}</Typography>
        <span> of </span>
        <Typography variant="inherit" as="span" tone="default" weight="semibold">{selectedDatasetsCount}</Typography>
        <span> {selectedDatasetsCount === 1 ? "dataset" : "datasets"} with matching data</span>
      </div>
    </div>
  );
};

export default OverviewHeaderStats;
