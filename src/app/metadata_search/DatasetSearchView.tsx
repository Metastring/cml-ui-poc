"use client";

import React, { ReactNode } from "react";
import { Search } from "lucide-react";
import SearchInput from "./SearchInput";
import type { MetadataSearchWhere } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";

interface DatasetSearchViewProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  whereToSearch: MetadataSearchWhere;
  onWhereToSearchChange: (value: MetadataSearchWhere) => void;
  children: ReactNode;
}

const WHERE_OPTIONS: { value: MetadataSearchWhere; label: string }[] = [
  { value: "anywhere", label: "Anywhere" },
  { value: "indicator", label: "Indicator" },
];

const DatasetSearchView: React.FC<DatasetSearchViewProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isLoading,
  whereToSearch,
  onWhereToSearchChange,
  children,
}) => {
  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
            <Search className="size-4 text-primary" aria-hidden />
            <span>Metadata search</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight sm:text-4xl">
            Search datasets by metadata
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-base">
            Find datasets by their descriptive metadata – titles, categories,
            and textual descriptions from the catalog. Enter a term to discover
            where relevant data lives.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <legend className="sr-only">Where to search</legend>
              <span className="text-sm font-medium text-foreground">
                Search in
              </span>
              <div
                className="flex gap-4"
                role="radiogroup"
                aria-label="Where to search"
              >
                {WHERE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground hover:text-foreground/90"
                  >
                    <input
                      type="radio"
                      name="where_to_search"
                      value={opt.value}
                      checked={whereToSearch === opt.value}
                      onChange={() => onWhereToSearchChange(opt.value)}
                      className="h-4 w-4 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={onSearchChange}
                  onSubmit={onSearchSubmit}
                  placeholder="Search across dataset metadata (e.g. river basin, rainfall, crop yield)"
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DatasetSearchView;

