"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Folder,
  FileText,
  Loader2,
  Search,
  Database,
} from "lucide-react";
import InstructionPopover from "@/element/popover/InstructionPopover";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { Category } from "@/types/api/federatedSearch.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function filterCatalog(data: Category[] | undefined, query: string): Category[] {
  if (!data?.length) return [];
  const q = query.trim().toLowerCase();
  if (!q) return data;
  return data
    .map((cat) => {
      const nameMatch = cat.category_name.toLowerCase().includes(q);
      const datasets = cat.datasets?.filter((ds) =>
        ds.dataset_title.toLowerCase().includes(q)
      );
      if (nameMatch) return { ...cat, datasets: cat.datasets };
      if (datasets?.length) return { ...cat, datasets };
      return null;
    })
    .filter((c): c is Category => c !== null && (c.datasets?.length ?? 0) > 0);
}

const MetadataPage = () => {
  const { data, isLoading, error } = useGetFilterData();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(
    () => filterCatalog(data ?? undefined, searchQuery),
    [data, searchQuery]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading catalog. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground italic">No categories or datasets found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Hero – data.gov.in style catalog header */}
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
            <Database className="size-4 text-primary" aria-hidden />
            <span>Open dataset catalog</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight sm:text-4xl">
            Dataset catalog
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-base">
            Browse and explore the full catalog of registered datasets from multiple
            remote databases. Select a dataset to view metadata, contacts, and
            statistics.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by category or dataset name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search catalog"
              />
            </div>
            <InstructionPopover title="Catalog">
              <p>
                Datasets are grouped by category. Use the search to filter by
                category or dataset name. Click &quot;View details&quot; to open
                full metadata.
              </p>
            </InstructionPopover>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground italic">
            No categories or datasets match your search.
          </p>
        ) : (
          <div className="space-y-10">
            {filtered.map((cat) => (
              <section key={cat.category_name}>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                  <Folder className="size-5 text-primary" aria-hidden />
                  {cat.category_name}
                  <Badge variant="secondary" className="ml-2 font-normal">
                    {cat.datasets?.length ?? 0} dataset
                    {(cat.datasets?.length ?? 0) !== 1 ? "s" : ""}
                  </Badge>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.datasets?.map((ds) => (
                    <Card
                      key={ds.dataset_title}
                      className="flex flex-col border-border/60 bg-card transition-shadow hover:shadow-md"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <FileText className="size-5 shrink-0 text-primary mt-0.5" />
                          <CardTitle className="text-base leading-snug line-clamp-2">
                            {ds.dataset_title}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2 mt-1">
                          {cat.category_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <Link
                            href={`/datasets/${encodeURIComponent(cat.category_name)}/${encodeURIComponent(ds.dataset_title)}`}
                          >
                            View details
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MetadataPage;
