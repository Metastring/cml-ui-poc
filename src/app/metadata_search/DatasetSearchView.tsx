"use client";

import React, { ReactNode } from "react";
import { Search } from "lucide-react";
import InstructionPopover from "@/element/popover/InstructionPopover";
import SearchInput from "./SearchInput";

interface DatasetSearchViewProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  children: ReactNode;
}

const DatasetSearchView: React.FC<DatasetSearchViewProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isLoading,
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
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
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
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DatasetSearchView;
