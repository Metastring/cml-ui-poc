"use client";

import React from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BiodiversitySearchBackdrop } from "@/app/federated_search/ui/BiodiversitySearchBackdrop";
import { SLIDE_TRANSITION } from "@/app/federated_search/utils/constants";
import { cn } from "@/lib/utils";
import { Option } from "@/types/app/federatedSearch.types";

interface SearchLandingSectionProps {
  isSearchLanding: boolean;
  isFilterLoading: boolean;
  isFilterError: boolean;
  indicatorList: Option[];
  searchError: string | null;
  children: React.ReactNode;
  onRetryFilters?: () => void;
}

export function SearchLandingSection({
  isSearchLanding,
  isFilterLoading,
  isFilterError,
  indicatorList,
  searchError,
  children,
  onRetryFilters,
}: SearchLandingSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden min-h-0 federated-search-landing-bg",
        SLIDE_TRANSITION,
        "flex flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6",
        isSearchLanding ? "" : "border-b border-border/80 shadow-sm"
      )}
    >
      <BiodiversitySearchBackdrop />

      <div
        className={cn(
          "w-full relative z-[1] overflow-hidden",
          SLIDE_TRANSITION,
          isSearchLanding ? "max-w-3xl space-y-4" : "max-w-3xl space-y-4"
        )}
      >
        <div className={cn(
          "space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-[1100ms] text-center"
        )}>
          <h2 className={cn(
            "font-semibold tracking-tight text-foreground leading-tight text-2xl sm:text-[2rem]",
            isSearchLanding ? "" : ""
          )}>
            Explore Datasets
          </h2>
          <p className={cn(
            "text-muted-foreground leading-relaxed text-sm sm:text-[0.925rem]",
            isSearchLanding ? "max-w-xl mx-auto" : ""
          )}>
            Discover records across connected datasets from multiple sources — one search, many sources.
          </p>
        </div>

        {isSearchLanding && isFilterLoading && (
          <div
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/20 bg-primary/[0.03] px-4 py-3 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading indicators…
          </div>
        )}

        {isSearchLanding && isFilterError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 space-y-2" role="alert">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Could not load indicators. Check your connection and try again.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onRetryFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {isSearchLanding && !isFilterLoading && !isFilterError && indicatorList.length === 0 && (
          <div
            className="rounded-lg border border-dashed border-border bg-muted/15 px-4 py-3 text-sm text-muted-foreground text-center"
            role="status"
          >
            No indicators available for the selected datasets.
          </div>
        )}

        {isSearchLanding && searchError && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-2 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{searchError}</p>
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
