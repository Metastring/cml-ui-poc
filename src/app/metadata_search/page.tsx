"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import DatasetSearchView from "./DatasetSearchView";
import { useGetMetadataOfDatasetByQuery } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { SearchMetadataResponse, SearchResultItem } from "./types";

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data, error, isLoading, refetch, isError } =
    useGetMetadataOfDatasetByQuery(submittedQuery);

  useEffect(() => {
    if (submittedQuery) refetch();
  }, [submittedQuery, refetch]);

  const response = data as SearchMetadataResponse | undefined;
  const results: SearchResultItem[] = response?.results ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSubmittedQuery(q);
  };

  const viewProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    onSearchSubmit: handleSearch,
    isLoading,
  };

  if (!submittedQuery) {
    return (
      <DatasetSearchView {...viewProps}>
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
          <Search size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">
            Search for relevant data in the metadata
          </p>
          <p className="text-sm mt-2 max-w-md">
            Enter a search term above and click Search to find datasets matching
            your query.
          </p>
        </div>
      </DatasetSearchView>
    );
  }
  if (isLoading) {
    return (
      <DatasetSearchView {...viewProps}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="text-base font-medium">Searching...</p>
        </div>
      </DatasetSearchView>
    );
  }
  if (isError) {
    return (
      <DatasetSearchView {...viewProps}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-red-600 font-medium">Something went wrong</p>
          <p className="text-sm text-gray-600 mt-1">
            {error instanceof Error
              ? error.message
              : "Please try again later."}
          </p>
        </div>
      </DatasetSearchView>
    );
  }
  if (results.length === 0) {
    return (
      <DatasetSearchView {...viewProps}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-base font-medium">No results found</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      </DatasetSearchView>
    );
  }

  return (
    <DatasetSearchView {...viewProps}>
      <div className="space-y-4">
        {results.map((item) => (
          <div
            key={item.dataset_id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {item.dataset_title}
              </h3>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-800">
                {item.category_name}
              </span>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </DatasetSearchView>
  );
};

export default Page;
