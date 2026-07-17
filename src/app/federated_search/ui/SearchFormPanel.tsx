"use client";

import React from "react";
import { Leaf, ListFilter, Loader2, Search, TextSearch, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Option } from "@/types/app/federatedSearch.types";
import { cn } from "@/lib/utils";
import { SLIDE_TRANSITION } from "@/app/federated_search/utils/constants";

interface SearchFormPanelProps {
  indicators: string[];
  indicatorList: Option[];
  selectedIndicatorLabels: string[];
  searchDraft: string;
  isFilterLoading: boolean;
  indicatorsReady: boolean;
  isFormBusy: boolean;
  hasDatasets: boolean;
  hasIndicators: boolean;
  hasSearchTerm: boolean;
  isSearchReady: boolean;
  showResultsPanel: boolean;
  onIndicatorChange: (val: string[]) => void;
  onSearchDraftChange: (val: string) => void;
  onSearch: () => void;
  onNewSearch?: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export function SearchFormPanel({
  indicators,
  indicatorList,
  selectedIndicatorLabels,
  searchDraft,
  isFilterLoading,
  indicatorsReady,
  isFormBusy,
  hasDatasets,
  hasIndicators,
  hasSearchTerm,
  isSearchReady,
  showResultsPanel,
  onIndicatorChange,
  onSearchDraftChange,
  onSearch,
  onNewSearch,
  searchInputRef,
}: SearchFormPanelProps) {
  const onRemoveIndicator = (value: string) =>
    onIndicatorChange(indicators.filter((item) => item !== value));

  return (
    <div
      className={cn(
        SLIDE_TRANSITION,
        "relative overflow-hidden",
        "federated-search-specimen-card rounded-2xl " +
          "p-0 sm:p-0 space-y-0 backdrop-blur-md"
      )}
    >
      <div className="federated-search-canopy-line h-1" aria-hidden />
      <div className="border-b border-primary/10 bg-primary/[0.04] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-primary/80">
          <Leaf className="h-3.5 w-3.5" />
          Field query
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Species · taxonomy · occurrence records
        </p>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <div className={cn("flex gap-3", showResultsPanel ? "flex-col" : "flex-row")}>
          {/* Indicators Section */}
          <div className="federated-search-field-panel rounded-xl border border-primary/10 p-3 space-y-2 flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 shadow-sm">
                <ListFilter className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">Indicators</p>
                  {indicators.length > 0 && (
                    <>
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px] bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 ring-1 ring-emerald-500/20 dark:text-emerald-400"
                      >
                        {indicators.length} selected
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Clear all indicators"
                        aria-label="Clear all indicators"
                        onClick={() => onIndicatorChange([])}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Pick one or more indicators to search across datasets.
                </p>
              </div>
            </div>
            <MultiSelectCombobox
              options={indicatorList}
              placeholder={isFilterLoading ? "Loading indicators…" : "Select indicators..."}
              value={indicators}
              onChange={onIndicatorChange}
              className="w-full h-11 bg-background/90 shadow-sm ring-1 ring-primary/10"
            />
            {indicators.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-primary/8 pt-3">
                {indicators.slice(0, 4).map((value, index) => (
                  <span
                    key={value}
                    className="inline-flex max-w-[10rem] items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary ring-1 ring-primary/15"
                    title={selectedIndicatorLabels[index]}
                  >
                    <Leaf className="h-2.5 w-2.5 shrink-0 opacity-60" />
                    <span className="truncate">{selectedIndicatorLabels[index]}</span>
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      title={`Remove ${selectedIndicatorLabels[index]}`}
                      aria-label={`Remove ${selectedIndicatorLabels[index]}`}
                      onClick={() => onRemoveIndicator(value)}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {indicators.length > 4 && (
                  <HoverCard openDelay={100} closeDelay={150}>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex cursor-pointer rounded-full bg-muted/80 px-2.5 py-1 text-[10px] text-muted-foreground ring-1 ring-border/60 hover:bg-muted"
                      >
                        +{indicators.length - 4} more
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent align="start" className="w-64 p-2">
                      <p className="px-1 pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Selected indicators
                      </p>
                      <div className="max-h-56 space-y-0.5 overflow-y-auto">
                        {indicators.map((value, index) => (
                          <div
                            key={value}
                            className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/60"
                          >
                            <Leaf className="h-2.5 w-2.5 shrink-0 text-primary/60" />
                            <span
                              className="min-w-0 flex-1 truncate text-[11px]"
                              title={selectedIndicatorLabels[index]}
                            >
                              {selectedIndicatorLabels[index]}
                            </span>
                            <button
                              type="button"
                              className="shrink-0 cursor-pointer rounded p-0.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              title={`Remove ${selectedIndicatorLabels[index]}`}
                              aria-label={`Remove ${selectedIndicatorLabels[index]}`}
                              onClick={() => onRemoveIndicator(value)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            )}
          </div>

          {/* Search Term Section */}
          <div className="federated-search-field-panel rounded-xl border border-primary/10 p-3 space-y-2 flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 shadow-sm">
                <TextSearch className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Search term</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Enter a keyword to search.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl ring-1 ring-primary/15 bg-background/90 focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-inner">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/40 to-accent/40" aria-hidden />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="e.g. Panthera leo, Quercus robur…"
                disabled={isFormBusy || !indicatorsReady}
                className="h-12 w-full border-0 pl-11 text-sm bg-transparent shadow-none focus-visible:ring-0"
                onChange={(e) => onSearchDraftChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isFormBusy && onSearch()}
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground/80">
              <span className="inline-flex items-center gap-1">
                <Leaf className="h-3 w-3 opacity-50" />
                Press Enter to search
              </span>
              {hasSearchTerm && (
                <span className="tabular-nums font-medium text-primary/70">
                  {searchDraft.trim().length} chars
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-primary/10 bg-primary/[0.03] p-2 ring-1 ring-primary/5">
          {[
            {
              label: "Datasets",
              ok: hasDatasets,
              detail: hasDatasets ? `${indicators.length} selected` : "Select in sidebar",
            },
            {
              label: "Indicators",
              ok: hasIndicators,
              detail: hasIndicators ? `${indicators.length} selected` : "Pick at least one",
            },
            {
              label: "Search term",
              ok: hasSearchTerm,
              detail: hasSearchTerm ? "Ready" : "Type to search",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-lg px-2 py-1.5 text-center",
                item.ok
                  ? "bg-emerald-500/8 ring-1 ring-emerald-500/20"
                  : "bg-background/60 ring-1 ring-border/50"
              )}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-medium">
                {item.ok ? (
                  <div className="h-3 w-3 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
                {item.label}
              </div>
              <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="pt-0.5 flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onSearch}
            disabled={isFormBusy || !indicatorsReady}
            size="default"
            className={cn(
              "gap-1.5 shrink-0 font-semibold transition-all h-12 w-full shadow-lg bg-primary hover:bg-primary/90",
              isSearchReady && "ring-2 ring-primary/40 shadow-lg shadow-primary/25"
            )}
          >
            {isFormBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
          {showResultsPanel && onNewSearch && (
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="h-12"
              onClick={onNewSearch}
              disabled={isFormBusy}
            >
              New search
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
