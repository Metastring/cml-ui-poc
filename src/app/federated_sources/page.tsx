"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Search, ChevronDown, ChevronUp, Terminal, Copy, Check } from "lucide-react";
import { useGetFederatedSourceData } from "@/api/federatedSourceApiHandler/FederatedSearchApiHandler";
import { Typography, typographyVariants } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface FederatedSource {
  dataset_name: string;
  source_api: string;
  source_curl?: string | null;
}

export default function FederatedSourcesPage() {
  // Federated Sources is currently disabled; direct URL access bounces to Dashboard.
  redirect("/");

  const { data, isLoading, isError } = useGetFederatedSourceData();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");

  const sources: FederatedSource[] = data?.sources ?? [];
  const filtered = query.trim()
    ? sources.filter((s) =>
        s.dataset_name.toLowerCase().includes(query.toLowerCase()) ||
        s.source_api.toLowerCase().includes(query.toLowerCase())
      )
    : sources;

  const toggle = (index: number) =>
    setExpanded((prev) => (prev === index ? null : index));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
            <Database className="size-4 text-primary" />
            <span>Federated Sources</span>
          </div>
          <Typography variant="h2" as="h1" tone="default" weight="bold" className="text-3xl">
            Connected Data Sources
          </Typography>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <Typography variant="h3" as="p" tone="default" className="text-2xl">
                {isLoading ? "…" : sources.length}
              </Typography>
              <Typography variant="small" tone="muted">Total sources</Typography>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search sources…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="px-5 py-4">
                  <div className="h-4 w-48 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 w-72 bg-muted/60 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-6 text-center">
            <Typography variant="error">Failed to load federated sources.</Typography>
            <Typography variant="small" tone="muted" className="mt-1">Check your network or API configuration.</Typography>
          </div>
        )}

        {/* Sources */}
        {!isLoading && !isError && (
          <div className="flex flex-col gap-3">
            {filtered.map((source, index) => {
              const isOpen = expanded === index;
              return (
                <Card
                  key={index}
                  className={`border-border/60 bg-card transition-all duration-200 ${isOpen ? "border-primary/30 shadow-md" : "hover:border-border hover:shadow-sm"}`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <Typography variant="h4" as="p" tone="default" className="leading-snug">
                          {source.dataset_name}
                        </Typography>
                        <Typography variant="mono" as="span" tone="muted" truncate className="block mt-1">
                          {source.source_api}
                        </Typography>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {source.source_curl ? (
                          <button
                            onClick={() => toggle(index)}
                            className={`${typographyVariants({ variant: "small", weight: "medium" })} flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                              isOpen
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <Terminal className="size-3.5" />
                            cURL
                            {isOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                          </button>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground/50 font-normal">
                            No cURL
                          </Badge>
                        )}
                      </div>
                    </div>

                    {isOpen && source.source_curl && (
                      <div className="border-t border-border/60 px-5 py-4 bg-muted/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Terminal className="size-3.5 text-muted-foreground" />
                            <Typography variant="small" as="span" tone="muted" weight="medium" className="uppercase tracking-wide">cURL Command</Typography>
                          </div>
                          <button
                            onClick={() => handleCopy(source.source_curl!)}
                            className={cn(typographyVariants({ variant: "small" }), "flex items-center gap-1.5 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors")}
                          >
                            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-3">
                          <pre className="text-xs text-emerald-400 whitespace-pre-wrap break-all font-mono leading-relaxed">
                            {source.source_curl}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
