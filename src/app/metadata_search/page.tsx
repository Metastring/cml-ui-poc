"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DatasetSearchView from "@/app/metadata_search/DatasetSearchView";
import {
  useGetMetadataOfDatasetByQuery,
  type MetadataSearchWhere,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { SearchMetadataResponse, SearchResultItem } from "./types";

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [whereToSearch, setWhereToSearch] = useState<MetadataSearchWhere>("anywhere");
  const [submittedWhereToSearch, setSubmittedWhereToSearch] =
    useState<MetadataSearchWhere>("anywhere");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data, error, isLoading, isFetching, refetch, isError } =
    useGetMetadataOfDatasetByQuery(submittedQuery, submittedWhereToSearch);

  const isBusy = isLoading || isFetching;

  useEffect(() => {
    if (submittedQuery) refetch();
  }, [submittedQuery, submittedWhereToSearch, refetch]);

  const response = data as SearchMetadataResponse | undefined;
  const results: SearchResultItem[] = useMemo(
    () => response?.results ?? [],
    [response?.results]
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(results.map((item) => item.category_name))).sort(),
    [results]
  );

  const filteredResults = useMemo(
    () =>
      results.filter((item) =>
        selectedCategories.length === 0
          ? true
          : selectedCategories.includes(item.category_name)
      ),
    [results, selectedCategories]
  );

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    const isSameQuery = q === submittedQuery;
    const isSameWhere = whereToSearch === submittedWhereToSearch;

    // If either query text or where_to_search changed, update state and let the effect refetch.
    if (!isSameQuery || !isSameWhere) {
      setSubmittedQuery(q);
      setSubmittedWhereToSearch(whereToSearch);
    } else {
      // Same inputs: force a manual refetch using the existing query params.
      refetch();
    }

    setSelectedCategories([]);
  };

  const viewProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    onSearchSubmit: handleSearch,
    isLoading: isBusy,
    whereToSearch,
    onWhereToSearchChange: setWhereToSearch,
  };

  if (!submittedQuery) {
    return (
      <DatasetSearchView {...viewProps}>
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-base font-medium">
            Start by searching across dataset metadata.
          </p>
          <p className="text-sm mt-1 max-w-md">
            Use terms from titles, categories, or descriptions to discover
            relevant datasets in the catalog.
          </p>
        </div>
      </DatasetSearchView>
    );
  }

  if (isBusy) {
    return (
      <DatasetSearchView {...viewProps}>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-8 animate-spin mb-4" />
          <p className="text-base font-medium">Searching metadata…</p>
        </div>
      </DatasetSearchView>
    );
  }

  if (isError) {
    return (
      <DatasetSearchView {...viewProps}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-destructive font-medium">Something went wrong</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
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
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-base font-medium">No results found</p>
          <p className="text-sm mt-1 max-w-md">
            Try adjusting your search term or using a different keyword from the
            dataset titles or descriptions.
          </p>
        </div>
      </DatasetSearchView>
    );
  }

  return (
    <DatasetSearchView {...viewProps}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredResults.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {results.length}
            </span>{" "}
            matching datasets
          </p>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((categoryName) => {
                const active = selectedCategories.includes(categoryName);
                const baseClasses =
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors cursor-pointer";
                const activeClasses =
                  "border-primary bg-primary/10 text-primary";
                const inactiveClasses =
                  "border-border bg-muted/40 text-foreground hover:bg-muted";

                return (
                  <button
                    key={categoryName}
                    type="button"
                    onClick={() => toggleCategory(categoryName)}
                    className={`${baseClasses} ${
                      active ? activeClasses : inactiveClasses
                    }`}
                  >
                    {categoryName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((item) => (
            <Link
              key={item.dataset_id}
              href={`/datasets/${encodeURIComponent(
                item.category_name
              )}/${encodeURIComponent(item.dataset_title)}`}
              className="group block h-full"
            >
              <Card className="flex h-full flex-col border-border/60 bg-card transition-all hover:shadow-md hover:border-primary/40 cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20 transition-colors mt-0.5">
                      <FileText className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-snug line-clamp-2">
                        {item.dataset_title}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 mt-1">
                        {item.category_name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  {item.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground mb-2">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary group-hover:bg-primary/20 group-hover:border-primary/60 transition-colors">
                      Explore dataset
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DatasetSearchView>
  );
};

export default Page;
