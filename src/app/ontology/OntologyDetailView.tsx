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
  FileCode,
} from "lucide-react";
import { deriveOntologyListFromTriples, getTermsForOntology } from "./ontologyTriples";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TermFilter = "all" | "classes" | "properties";

interface OntologyDetailViewProps {
  ontologyId: string;
}

export default function OntologyDetailView({
  ontologyId,
}: OntologyDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [termFilter, setTermFilter] = useState<TermFilter>("all");
  const [pageSize, setPageSize] = useState(25);
  const [copiedIri, setCopiedIri] = useState(false);

  const { data: triplesResponse, isLoading, isError, error } = useOntologyTriples();
  const triples = triplesResponse?.triples ?? [];

  const summary = useMemo(() => {
    const list = deriveOntologyListFromTriples(triples);
    return list.find((o) => o.id === ontologyId);
  }, [ontologyId, triples]);

  const allTerms = useMemo(
    () => getTermsForOntology(ontologyId, triples),
    [ontologyId, triples]
  );

  const filteredByType = useMemo(() => {
    if (termFilter === "classes")
      return allTerms.filter((t) => t.type === "Class");
    if (termFilter === "properties")
      return allTerms.filter((t) => t.type === "Property");
    return allTerms;
  }, [allTerms, termFilter]);

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;
    const q = searchQuery.trim().toLowerCase();
    return filteredByType.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q) ||
        t.comment.toLowerCase().includes(q) ||
        (t.parentId && t.parentId.toLowerCase().includes(q))
    );
  }, [filteredByType, searchQuery]);

  const paginatedTerms = useMemo(
    () => filteredTerms.slice(0, pageSize),
    [filteredTerms, pageSize]
  );

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

  if (isError) {
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
              <strong className="text-foreground">{summary.numClasses}</strong>{" "}
              classes
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Tag className="size-4 text-primary" />
              <strong className="text-foreground">
                {summary.numProperties}
              </strong>{" "}
              properties
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs: All | Classes | Properties (OLS separates these) */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
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

        {/* Terms table (OLS-style: IRI/ID, label, type, parent, description) */}
        <Card className="border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b bg-muted/30">
                <TableHead className="font-semibold w-[140px]">
                  Term ID
                </TableHead>
                <TableHead className="font-semibold">Label</TableHead>
                <TableHead className="font-semibold w-24">Type</TableHead>
                <TableHead className="font-semibold w-32 hidden md:table-cell">
                  Parent
                </TableHead>
                <TableHead className="font-semibold hidden sm:table-cell max-w-xs">
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTerms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-12"
                  >
                    No terms match your search. Try a different filter or query.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTerms.map((term) => (
                  <TableRow key={term.id} className="group">
                    <TableCell className="font-mono text-xs align-top py-3">
                      <span className="text-foreground">{term.id}</span>
                    </TableCell>
                    <TableCell className="font-medium align-top py-3">
                      {term.label}
                    </TableCell>
                    <TableCell className="align-top py-3">
                      <Badge
                        variant={term.type === "Class" ? "secondary" : "outline"}
                        className="font-normal text-xs"
                      >
                        {term.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground align-top py-3 hidden md:table-cell">
                      {term.parentId ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top py-3 hidden sm:table-cell max-w-xs">
                      {term.comment || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <p className="mt-3 text-sm text-muted-foreground">
          Showing 1 to {paginatedTerms.length} of {filteredTerms.length} terms
          {filteredTerms.length !== allTerms.length && " (filtered)"}.
        </p>

        {/* OLS-style: short info card */}
        <Card className="mt-8 border-border/60 bg-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileCode className="size-4 text-primary" />
              About this ontology
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed pt-0">
            Terms are identified by a local name (Term ID) within the ontology
            IRI. Classes represent concepts; properties represent relationships
            or attributes. Use the Parent column to see hierarchy (e.g. rdfs:subClassOf).
            Map your dataset fields to these terms in the Contribute flow for
            consistent discovery.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
