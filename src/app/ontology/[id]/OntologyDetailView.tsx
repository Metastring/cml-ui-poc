"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Copy,
  Check,
  Layers,
  Tag,
} from "lucide-react";
import { deriveOntologyListFromTriples } from "../ontologyTriples";
import {
  useOntologyTriples,
  useOntologyTermsByTab,
  useOntologyClasses,
  useOntologyDatatypeProperties,
  isOntologyWithDetailApis,
} from "../api";
import { dummyOntologyList } from "../dummyOntologyList";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TermFilter = "all" | "classes" | "properties";

/** Column keys for the detail table (API/data shape). */
export type OntologyDetailColumnKey =
  | "entity"
  | "label"
  | "type"
  | "description";

/** Display labels for columns (Real Data style: spaces, no underscores). */
export const ONTOLOGY_DETAIL_COLUMNS: Record<OntologyDetailColumnKey, string> = {
  entity: "Entity",
  label: "Label",
  type: "Type",
  description: "Description",
};

interface OntologyDetailViewProps {
  ontologyId: string;
}

export default function OntologyDetailView({
  ontologyId,
}: OntologyDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [termFilter, setTermFilter] = useState<TermFilter>("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [copiedIri, setCopiedIri] = useState(false);

  const { data: triplesResponse, isLoading: triplesLoading, isError: triplesError, error: triplesErrorObj } = useOntologyTriples();
  const triples = useMemo(
    () => triplesResponse?.triples ?? [],
    [triplesResponse?.triples]
  );

  const summary = useMemo(() => {
    const list = deriveOntologyListFromTriples(triples);
    const fromTriples = list.find((o) => o.id === ontologyId);
    if (fromTriples) return fromTriples;
    return dummyOntologyList.find((o) => o.id === ontologyId);
  }, [ontologyId, triples]);

  const {
    terms: tableTerms,
    isLoading: termsLoading,
    isError: termsError,
    error: termsErrorObj,
  } = useOntologyTermsByTab(ontologyId, termFilter);

  const {
    classes,
    isLoading: classesLoading,
    isError: classesError,
    error: classesErrorObj,
  } = useOntologyClasses(ontologyId);

  const {
    properties,
    isLoading: propertiesLoading,
    isError: propertiesError,
    error: propertiesErrorObj,
  } = useOntologyDatatypeProperties(ontologyId);

  const hasDetailApis = isOntologyWithDetailApis(ontologyId);

  const isLoading =
    triplesLoading ||
    (hasDetailApis &&
      (termFilter === "classes"
        ? classesLoading
        : termFilter === "properties"
          ? propertiesLoading
          : termsLoading));
  const isError =
    triplesError ||
    (hasDetailApis &&
      (termFilter === "classes"
        ? classesError
        : termFilter === "properties"
          ? propertiesError
          : termsError));
  const error =
    hasDetailApis
      ? termFilter === "classes"
        ? classesErrorObj
        : termFilter === "properties"
          ? propertiesErrorObj
          : termsErrorObj
      : triplesErrorObj;

  const filteredByType = tableTerms;

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;
    const q = searchQuery.trim().toLowerCase();
    return filteredByType.filter(
      (item) =>
        item.entity.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [filteredByType, searchQuery]);

  const filteredClasses = useMemo(() => {
    if (termFilter !== "classes") return [];
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.trim().toLowerCase();
    return classes.filter(
      (c) =>
        c.local_name.toLowerCase().includes(q) ||
        c.class_uri.toLowerCase().includes(q)
    );
  }, [classes, searchQuery, termFilter]);

  const filteredProperties = useMemo(() => {
    if (termFilter !== "properties") return [];
    if (!searchQuery.trim()) return properties;
    const q = searchQuery.trim().toLowerCase();
    return properties.filter(
      (p) =>
        p.local_name.toLowerCase().includes(q) ||
        p.property_uri.toLowerCase().includes(q)
    );
  }, [properties, searchQuery, termFilter]);

  // Reset to page 1 when changing filter/search/pageSize/ontology.
  React.useEffect(() => {
    setPage(1);
  }, [ontologyId, termFilter, searchQuery, pageSize]);

  const activeTotal =
    termFilter === "classes"
      ? filteredClasses.length
      : termFilter === "properties"
        ? filteredProperties.length
        : filteredTerms.length;
  const totalPages = Math.max(1, Math.ceil(activeTotal / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStartIdx = (safePage - 1) * pageSize;
  const pageEndIdxExclusive = pageStartIdx + pageSize;

  const paginatedTerms = useMemo(() => {
    if (termFilter !== "all") return [];
    return filteredTerms.slice(pageStartIdx, pageEndIdxExclusive);
  }, [filteredTerms, pageEndIdxExclusive, pageStartIdx, termFilter]);

  const paginatedClasses = useMemo(() => {
    if (termFilter !== "classes") return [];
    return filteredClasses.slice(pageStartIdx, pageEndIdxExclusive);
  }, [filteredClasses, pageEndIdxExclusive, pageStartIdx, termFilter]);

  const paginatedProperties = useMemo(() => {
    if (termFilter !== "properties") return [];
    return filteredProperties.slice(pageStartIdx, pageEndIdxExclusive);
  }, [filteredProperties, pageEndIdxExclusive, pageStartIdx, termFilter]);

  const ontologyIri = summary?.graphIri ?? `http://cml.org/ontology/${ontologyId}`;

  const copyIri = () => {
    void navigator.clipboard.writeText(ontologyIri);
    setCopiedIri(true);
    setTimeout(() => setCopiedIri(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="text-muted-foreground">Loading ontology…</span>
      </div>
    );
  }

  if (isError && !summary) {
    return (
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Button variant="ghost" asChild>
            <Link href="/ontology" className="gap-2">
              <ArrowLeft className="size-4" /> Back to Ontologies
            </Link>
          </Button>
          <Card className="mt-6 border-destructive/30 bg-destructive/5">
            <CardContent className="py-8">
              <p className="font-medium text-destructive">Failed to load ontology data</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Please try again later."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Button variant="ghost" asChild>
            <Link href="/ontology" className="gap-2">
              <ArrowLeft className="size-4" /> Back to Ontologies
            </Link>
          </Button>
          <Card className="mt-6 border-destructive/30 bg-destructive/5">
            <CardContent className="py-8 text-center text-muted-foreground">
              Ontology &quot;{ontologyId}&quot; not found.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* OLS-style: breadcrumb + header */}
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
            <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 gap-1">
              <Link href="/ontology">
                <ArrowLeft className="size-3.5" />
                Ontologies
              </Link>
            </Button>
            <ChevronRight className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">{summary.title}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {summary.title}
              </h1>
              <p className="font-mono text-sm text-muted-foreground mt-1">
                {ontologyId}
              </p>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {ontologyId}
            </Badge>
          </div>

          {summary.description && (
            <p className="mt-3 text-muted-foreground text-sm max-w-2xl">
              {summary.description}
            </p>
          )}

          {/* IRI row (OLS shows full IRI) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              IRI
            </span>
            <code className="flex-1 min-w-0 text-xs font-mono bg-muted/60 px-2 py-1.5 rounded truncate max-w-2xl">
              {ontologyIri}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0"
              onClick={copyIri}
            >
              {copiedIri ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          {/* Stats (OLS-style: classes / properties counts) */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="size-4 text-primary" />
              <strong className="text-foreground">
                {hasDetailApis ? classes.length : summary.numClasses}
              </strong>{" "}
              classes
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Tag className="size-4 text-primary" />
              <strong className="text-foreground">
                {hasDetailApis ? properties.length : summary.numProperties}
              </strong>{" "}
              properties
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Tabs: All | Classes | Properties (OLS separates these) */}
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <div className="flex rounded-md border border-border/60 p-0.5 bg-muted/30">
            {(
              [
                { value: "all" as TermFilter, label: "All terms" },
                { value: "classes" as TermFilter, label: "Classes" },
                { value: "properties" as TermFilter, label: "Properties" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTermFilter(value)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition ${
                  termFilter === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
                aria-label="Search terms"
              />
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              Show
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-[72px] h-9" aria-label="Terms per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              entries
            </span>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm text-muted-foreground">
            Page <span className="text-foreground font-medium">{safePage}</span> of{" "}
            <span className="text-foreground font-medium">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Terms table: scroll container is direct parent of table so sticky header works */}
        <Card className="border-border/60 overflow-hidden py-0">
          {termFilter === "classes" ? (
            <div className="max-h-[60vh] overflow-auto p-4">
              {paginatedClasses.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 text-sm">
                  No classes match your search.
                </div>
              ) : (
                <ul className="space-y-2">
                  {paginatedClasses.map((c) => (
                    <li
                      key={c.class_uri}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background px-3 py-2"
                    >
                      <span className="font-medium text-foreground">
                        {c.local_name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : termFilter === "properties" ? (
            <div className="max-h-[60vh] overflow-auto p-4">
              {paginatedProperties.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 text-sm">
                  No properties match your search.
                </div>
              ) : (
                <ul className="space-y-2">
                  {paginatedProperties.map((p) => (
                    <li
                      key={p.property_uri}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background px-3 py-2"
                    >
                      <span className="font-medium text-foreground">
                        {p.local_name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full caption-bottom text-sm border-collapse">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b bg-muted">
                  <TableHead className="sticky top-0 z-10 bg-muted font-semibold w-[180px] align-middle py-3 shadow-[0_1px_0_0_hsl(var(--border))]">
                    {ONTOLOGY_DETAIL_COLUMNS.entity}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-muted font-semibold align-middle py-3 shadow-[0_1px_0_0_hsl(var(--border))]">
                    {ONTOLOGY_DETAIL_COLUMNS.label}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-muted font-semibold w-28 align-middle py-3 shadow-[0_1px_0_0_hsl(var(--border))]">
                    {ONTOLOGY_DETAIL_COLUMNS.type}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-muted font-semibold hidden sm:table-cell max-w-xs align-middle py-3 shadow-[0_1px_0_0_hsl(var(--border))]">
                    {ONTOLOGY_DETAIL_COLUMNS.description}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTerms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-12"
                    >
                      No terms match your search. Try a different filter or query.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTerms.map((item, index) => (
                    <TableRow
                      key={`${item.entity}-${item.label}-${index}`}
                      className="group"
                    >
                      <TableCell className="font-mono text-xs align-middle py-3">
                        <span className="text-foreground">{item.entity}</span>
                      </TableCell>
                      <TableCell className="font-medium align-middle py-3">
                        {item.label}
                      </TableCell>
                      <TableCell className="align-middle py-3">
                        <Badge
                          variant="outline"
                          className="font-normal text-xs"
                        >
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm align-middle py-3 hidden sm:table-cell max-w-xs">
                        {item.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </table>
            </div>
          )}
        </Card>

        <p className="mt-2 text-sm text-muted-foreground">
          Showing{" "}
          {activeTotal === 0 ? 0 : pageStartIdx + 1} to{" "}
          {Math.min(pageStartIdx + pageSize, activeTotal)} of {activeTotal}{" "}
          {termFilter === "classes"
            ? "classes"
            : termFilter === "properties"
              ? "properties"
              : "terms"}
          {termFilter === "all" &&
            filteredTerms.length !== tableTerms.length &&
            " (filtered)"}
          .
        </p>
      </main>
    </div>
  );
}
