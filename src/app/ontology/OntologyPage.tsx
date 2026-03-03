"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Network,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { deriveOntologyListFromTriples, type OntologySummary } from "./ontologyTriples";
import { useOntologyTriples } from "./api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function filterOntologies(
  list: OntologySummary[],
  query: string,
  exactMatch: boolean
): OntologySummary[] {
  if (!list?.length) return [];
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((o) => {
    const matchId = o.id.toLowerCase().includes(q);
    const matchTitle = o.title.toLowerCase().includes(q);
    const matchDesc = o.description.toLowerCase().includes(q);
    if (exactMatch) {
      return o.id.toLowerCase() === q || o.title.toLowerCase() === q;
    }
    return matchId || matchTitle || matchDesc;
  });
}

const OntologyPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [exactMatch, setExactMatch] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const { data: triplesResponse, isLoading, isError, error } = useOntologyTriples();
  const triples = useMemo(
    () => triplesResponse?.triples ?? [],
    [triplesResponse?.triples]
  );
  const totalCount = triplesResponse?.count ?? 0;

  /** Derive ontology list from triples (from API) */
  const ontologyList = useMemo(
    () => deriveOntologyListFromTriples(triples),
    [triples]
  );

  const filtered = useMemo(
    () => filterOntologies(ontologyList, searchQuery, exactMatch),
    [ontologyList, searchQuery, exactMatch]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="text-muted-foreground">Loading ontologies...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">Failed to load ontologies</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Please try again later."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* OLS-style header: title, short intro, search + filters */}
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
            <Network className="size-4 text-primary" aria-hidden />
            <span>Ontology Lookup Service</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight sm:text-4xl">
            Ontologies
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-base">
            Browse and search ontologies used across the platform. Each ontology
            provides a shared vocabulary of classes and properties for
            consistent data annotation—similar to{" "}
            <a
              href="https://www.ebi.ac.uk/ols4/ontologies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              EBI OLS
            </a>
            .
          </p>

          {/* Search + filters row (OLS-style) */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ontology ID, title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search ontologies"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={exactMatch}
                  onChange={(e) => setExactMatch(e.target.checked)}
                  className="rounded border-input"
                />
                Exact match
              </label>
              <span className="text-muted-foreground text-sm">
                Show{" "}
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="w-[72px] h-8" aria-label="Results per page">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>{" "}
                entries
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="py-12 text-center text-muted-foreground">
              No ontologies match your search. Try a different query or clear
              &quot;Exact match&quot;.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="font-semibold">Ontology</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-right w-24">
                      Classes
                    </TableHead>
                    <TableHead className="font-semibold text-right w-24">
                      Properties
                    </TableHead>
                    <TableHead className="font-semibold w-20 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered
                    .slice(0, pageSize)
                    .map((ont) => (
                      <TableRow key={ont.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {ont.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {ont.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate hidden sm:table-cell">
                          {ont.description || "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {ont.numClasses}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {ont.numProperties}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/ontology/${encodeURIComponent(ont.id)}`}
                              className="gap-1"
                            >
                              View
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>

            <p className="mt-4 text-sm text-muted-foreground">
              Showing {Math.min(filtered.length, pageSize)} of {filtered.length}{" "}
              ontologies
              {filtered.length < ontologyList.length && " (filtered)"}. Total triples: {totalCount}.
            </p>
          </>
        )}

        {/* Short OLS-style info blurb */}
        <Card className="mt-12 border-border/60 bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" />
              About this service
            </CardTitle>
            <CardContent className="text-sm text-muted-foreground leading-relaxed pt-0">
              Ontologies are listed by graph. Each row shows the ontology ID,
              title, description, number of classes and properties, and a link to
              browse terms. Data is derived from RDF triples; you can map your
              dataset fields to these terms in the Contribute flow.
            </CardContent>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};

export default OntologyPage;
