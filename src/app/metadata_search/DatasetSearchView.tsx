"use client";

import React, { ReactNode } from "react";
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
    <div className="h-screen overflow-y-auto p-6 bg-white text-sm flex flex-col space-y-4">
      <InstructionPopover title="Metadata Search">
        <p>
          Search across metadata to find relevant data. Enter your query and
          click Search. Results are shown as cards with dataset title, category,
          and description.
        </p>
      </InstructionPopover>
      <div className="flex justify-center">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Search for data across datasets (e.g. river, rainfall, crop yield)"
          isLoading={isLoading}
        />
      </div>
      <div className="flex-1 mt-2">
        {children}
      </div>
    </div>
  );
};

export default DatasetSearchView;
