"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Network, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatOntologyGroup } from "./cphrOntologyGroupLabels";
import {
  getCphrOntologyBaseUrl,
  useOntologySearch,
  useOntologySummary,
} from "./cphrOntologyHooks";
import OntologyClassesTabContent from "./OntologyClassesTabContent";
import OntologyFieldMapTabContent from "./OntologyFieldMapTabContent";
import OntologyGraphTabContent from "./OntologyGraphTabContent";
import OntologyPropertiesTabContent from "./OntologyPropertiesTabContent";

type ExplorerTab = "classes" | "properties" | "graph" | "fieldMap";

const TABS: { id: ExplorerTab; label: string }[] = [
  { id: "classes", label: "Classes" },
  { id: "properties", label: "Properties" },
  { id: "graph", label: "Graph" },
  { id: "fieldMap", label: "Field map" },
];

export default function OntologyExplorer() {
  const baseUrl = getCphrOntologyBaseUrl();
  const apiEnabled = Boolean(baseUrl);

  const summaryQ = useOntologySummary(apiEnabled);
  const [tab, setTab] = useState<ExplorerTab>("classes");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput), 320);
    return () => clearTimeout(t);
  }, [searchInput]);

  const searchQ = useOntologySearch(debouncedQ, apiEnabled);

  const summaryGroupKeys = useMemo(
    () => Object.keys(summaryQ.data?.groups ?? {}),
    [summaryQ.data?.groups]
  );

  if (!apiEnabled) {
    return (
      <div className="min-h-full bg-background p-6">
        <Card className="max-w-lg border-border/60">
          <CardHeader>
            <CardTitle>Ontology API not configured</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Set{" "}
              <code className="text-xs bg-muted px-1 rounded">
                NEXT_PUBLIC_ONTOLOGY_BASE_URL
              </code>{" "}
              to your CPHR backend (e.g.{" "}
              <code className="text-xs bg-muted px-1 rounded">
                http://139.59.23.148:8000
              </code>
              ), or point{" "}
              <code className="text-xs bg-muted px-1 rounded">
                NEXT_PUBLIC_FEDERATED_BASE_URL
              </code>{" "}
              at the same host if ontology routes are served there.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
            <Network className="size-4 text-primary" aria-hidden />
            <span>CPHR ontology</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {summaryQ.data?.title ?? "Ontology explorer"}
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground text-sm leading-relaxed">
            {summaryQ.data?.description ??
              "Browse classes, properties, hierarchy, and field coverage from the backend API."}
          </p>
          {summaryQ.data?.created && (
            <p className="mt-1 text-xs text-muted-foreground">
              Last ontology snapshot: {summaryQ.data.created}
            </p>
          )}

          {summaryQ.isLoading && (
            <div className="mt-6 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Loading summary…</span>
            </div>
          )}

          {summaryQ.isError && (
            <p className="mt-4 text-sm text-destructive">
              {summaryQ.error instanceof Error
                ? summaryQ.error.message
                : "Summary request failed"}
            </p>
          )}

          {summaryQ.data && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CountCard label="Classes" value={summaryQ.data.class_count} />
              <CountCard
                label="Object properties"
                value={summaryQ.data.object_property_count}
              />
              <CountCard
                label="Datatype properties"
                value={summaryQ.data.datatype_property_count}
              />
              <CountCard
                label="Group buckets"
                value={Object.keys(summaryQ.data.groups ?? {}).length}
              />
            </div>
          )}

          {summaryQ.data?.groups && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(summaryQ.data.groups).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs"
                >
                  <span className="font-medium">
                    {formatOntologyGroup(k)}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {v}
                  </span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              className="pl-9"
              placeholder="Search classes and properties (min 2 characters)…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Ontology search"
            />
            {searchInput.trim().length >= 2 && (
              <SearchResultsPanel
                query={debouncedQ.trim()}
                searchQ={searchQ}
                onPickClass={(name) => {
                  setSelectedClass(name);
                  setTab("classes");
                  setSearchInput("");
                  setDebouncedQ("");
                }}
                onPickProperty={() => setTab("properties")}
              />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-4 border-b border-border/60 pb-3">
          {TABS.map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              variant={tab === id ? "secondary" : "ghost"}
              size="sm"
              className="h-9"
              onClick={() => setTab(id)}
            >
              {label}
            </Button>
          ))}
        </div>

        {tab === "classes" && (
          <OntologyClassesTabContent
            apiEnabled={apiEnabled}
            summaryGroupKeys={summaryGroupKeys}
            selectedClassName={selectedClass}
            onSelectedClassNameChange={setSelectedClass}
          />
        )}
        {tab === "properties" && (
          <OntologyPropertiesTabContent apiEnabled={apiEnabled} />
        )}
        {tab === "graph" && <OntologyGraphTabContent apiEnabled={apiEnabled} />}
        {tab === "fieldMap" && (
          <OntologyFieldMapTabContent apiEnabled={apiEnabled} />
        )}
      </main>
    </div>
  );
}

function CountCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="py-3 pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function SearchResultsPanel({
  query,
  searchQ,
  onPickClass,
  onPickProperty,
}: {
  query: string;
  searchQ: ReturnType<typeof useOntologySearch>;
  onPickClass: (name: string) => void;
  onPickProperty: () => void;
}) {
  if (searchQ.isLoading) {
    return (
      <div className="absolute z-20 mt-1 w-full max-w-xl rounded-md border border-border bg-card p-3 shadow-md">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (searchQ.isError) {
    return (
      <div className="absolute z-20 mt-1 w-full max-w-xl rounded-md border border-destructive/30 bg-card p-3 text-sm text-destructive">
        {searchQ.error instanceof Error
          ? searchQ.error.message
          : "Search failed"}
      </div>
    );
  }
  const d = searchQ.data;
  if (!d) return null;
  const empty = d.class_count === 0 && d.property_count === 0;
  return (
    <div className="absolute z-20 mt-1 w-full max-w-xl max-h-72 overflow-y-auto rounded-md border border-border bg-card shadow-md text-sm">
      {empty ? (
        <p className="p-3 text-muted-foreground">No results for “{query}”.</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {d.classes.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-muted/50"
                onClick={() => onPickClass(c.name)}
              >
                <span className="font-mono text-xs text-primary">{c.name}</span>
                <span className="block text-muted-foreground text-xs">
                  {c.label}
                </span>
              </button>
            </li>
          ))}
          {d.properties.map((p) => (
            <li key={p.name}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-muted/50"
                onClick={onPickProperty}
              >
                <span className="font-mono text-xs">{p.name}</span>
                <span className="block text-muted-foreground text-xs">
                  {p.label} · property
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
