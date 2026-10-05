"use client";

import React from "react";
import {
  AlertCircle,
  ChevronDown,
  Database,
  Loader2,
  Sparkles,
  CornerDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BiodiversitySearchBackdrop } from "@/app/federated_search/ui/BiodiversitySearchBackdrop";
import { SmartSearchSwitch } from "@/components/smart_search/SmartSearchSwitch";
import { useMutateSmartSearch } from "@/api/smartSearchApiHandler/SmartSearchApiHandler";
import { cn } from "@/lib/utils";

const EXAMPLE_QUESTIONS = [
  "districts with total rainfall more than 3000 mm in 2025",
  "top 3 districts with the highest total rainfall in 2025",
  "on how many days did Pune get more than 50 mm of rain in 2025?",
  "districts in Kerala with average daily rainfall more than 8 mm",
];

/** Questions are capped at 500 characters by the backend. */
const MAX_QUESTION_LENGTH = 500;

/** The backend appends LIMIT 100 to generated SQL. */
const ROW_LIMIT = 100;

/**
 * Staged copy for the wait. The backend picks a dataset in ~0.2s, spends 30-55s
 * having the model write SQL, then runs it in ~0.1s — so the long middle
 * stage is the honest one to dwell on.
 */
const LOADING_STAGES: { until: number; label: string }[] = [
  { until: 5, label: "Reading your question…" },
  { until: 14, label: "Finding the dataset that can answer it…" },
  { until: 32, label: "Writing a query for your question…" },
  { until: 50, label: "Checking the query against the data…" },
];

const LAST_STAGE_LABEL =
  "Still working — this one is taking longer than usual…";

/** Where the progress bar tops out, so it never claims to be finished. */
const PROGRESS_CEILING = 94;

/** Roughly how long a question takes, used only to pace the bar. */
const EXPECTED_SECONDS = 55;

export function SmartSearchPanel() {
  const [question, setQuestion] = React.useState("");
  const [elapsed, setElapsed] = React.useState(0);
  const [showSql, setShowSql] = React.useState(false);
  const { data, error, mutate, isMutating, isError } = useMutateSmartSearch();

  // These questions take 30-60s, so show the user that time is passing.
  React.useEffect(() => {
    if (!isMutating) return;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isMutating]);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isMutating) return;
    setShowSql(false);
    mutate({ question: trimmed });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(question);
  };

  const stageLabel =
    LOADING_STAGES.find((stage) => elapsed < stage.until)?.label ??
    LAST_STAGE_LABEL;
  const progress = Math.min(
    PROGRESS_CEILING,
    Math.round((elapsed / EXPECTED_SECONDS) * 100)
  );

  const hasRows = (data?.rows?.length ?? 0) > 0;
  const noRows = Boolean(data) && !hasRows;
  const isIdle = !data && !isMutating && !isError;

  return (
    <section className="relative flex h-screen flex-col overflow-hidden federated-search-landing-bg">
      <BiodiversitySearchBackdrop />

      <div className="absolute right-4 top-4 z-[2] sm:right-6 sm:top-6">
        <SmartSearchSwitch />
      </div>

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-auto">
        <div
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-8 lg:px-12",
            // Centre the whole thing until there is something to show.
            isIdle && "flex-1 justify-center"
          )}
        >
          {/* Hero */}
          <div className="space-y-2 text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-[900ms]">
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2rem]">
              Explore Datasets
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[0.925rem]">
              Discover records across connected datasets from multiple sources
              — one search, many sources.
            </p>
            <p className="mx-auto max-w-2xl pt-1 text-xs leading-relaxed text-muted-foreground/90">
              Ask a full question in plain language, the way you would say it
              out loud. Name the place and the period you care about, and add a
              threshold or range if you have one — the dataset is picked for
              you.
            </p>
          </div>

          {/* Composer */}
          <div className="federated-search-specimen-card relative overflow-hidden rounded-2xl backdrop-blur-md">
            <div className="federated-search-canopy-line h-1" aria-hidden />
            <form onSubmit={handleSubmit} className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={MAX_QUESTION_LENGTH}
                    placeholder="e.g. districts in Kerala with average daily rainfall more than 8 mm"
                    className="py-5 pr-16"
                    disabled={isMutating}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] text-muted-foreground">
                    <CornerDownLeft className="h-3 w-3" aria-hidden />
                    Enter
                  </span>
                </div>
                <Button
                  type="submit"
                  className="py-5 sm:w-28"
                  disabled={isMutating || question.trim().length === 0}
                >
                  {isMutating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Ask"
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUESTIONS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    disabled={isMutating}
                    onClick={() => {
                      setQuestion(example);
                      submit(example);
                    }}
                    className="rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1 text-xs text-muted-foreground transition-all hover:-translate-y-px hover:border-primary/30 hover:text-foreground disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Working */}
          {isMutating && (
            <div
              className="rounded-2xl border border-primary/20 bg-primary/[0.03] px-5 py-10"
              role="status"
              aria-live="polite"
            >
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
                <Sparkles
                  className="h-7 w-7 animate-pulse text-primary"
                  aria-hidden
                />

                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {stageLabel}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your question is being turned into a database query written
                    just for it — that is the part worth waiting for.
                  </p>
                </div>

                <div
                  className="h-1 w-full overflow-hidden rounded-full bg-primary/10"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-[11px] tabular-nums text-muted-foreground/80">
                  {elapsed}s
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!isMutating && isError && (
            <div
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>
                {error?.message ?? "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          {/* Result */}
          {!isMutating && !isError && data && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              {data.interpretation && (
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Understood as: </span>
                  {data.interpretation}
                </p>
              )}

              {data.dataset && (
                <div className="rounded-xl border border-primary/10 bg-card/60 px-4 py-3 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Database className="size-4 text-primary" aria-hidden />
                    <span className="text-sm font-medium text-foreground">
                      {data.dataset.title}
                    </span>
                    <Badge variant="secondary" className="text-[11px]">
                      match {data.dataset.match_score}
                    </Badge>
                  </div>
                  {data.dataset.citation && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {data.dataset.citation}
                    </p>
                  )}
                </div>
              )}

              {noRows && (
                <div className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No rows came back for this question.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The data may not cover what you asked. Try rephrasing, or
                    naming a district, state or year explicitly.
                  </p>
                </div>
              )}

              {hasRows && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {data.row_count}
                      </span>{" "}
                      row{data.row_count === 1 ? "" : "s"}
                      {typeof data.timings?.total_s === "number" &&
                        ` · ${data.timings.total_s}s`}
                    </p>
                    {data.truncated && (
                      <Badge
                        variant="secondary"
                        className="text-[11px] text-amber-700 dark:text-amber-400"
                      >
                        truncated at {ROW_LIMIT} rows
                      </Badge>
                    )}
                  </div>

                  <div className="overflow-auto rounded-xl border border-primary/10 bg-card/60 backdrop-blur-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {data.columns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>
                                {cell === null ? "—" : String(cell)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {data.sql && (
                <div className="rounded-xl border border-primary/10 bg-card/60 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setShowSql((prev) => !prev)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <span>View SQL</span>
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        showSql && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>
                  {showSql && (
                    <pre className="overflow-auto border-t border-primary/10 px-4 py-3 text-xs leading-relaxed text-foreground">
                      {data.sql}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
