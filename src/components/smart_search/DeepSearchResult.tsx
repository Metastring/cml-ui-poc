"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartSearchResultTable } from "@/components/smart_search/SmartSearchResultTable";
import {
  AskAnswerEvent,
  AskObservationEvent,
  AskStepEvent,
  SmartSearchCell,
  SmartSearchResponse,
} from "@/types/api/smartSearch.types";
import { cn } from "@/lib/utils";

/** Rows the agent pulled from one dataset, shown as a table card. */
interface DatasetResult {
  key: string;
  title: string;
  subtitle?: string;
  citation?: string | null;
  columns: string[];
  rows: SmartSearchCell[][];
  truncated?: boolean;
}

const quote = (value: unknown) => (value ? `“${String(value)}”` : "");

/** Plain-language label for what the agent is doing in a step. */
const describeStep = ({ action, action_input: input }: AskStepEvent) => {
  switch (action) {
    case "metadata_search":
      return `Looking for datasets about ${quote(input.query)}`;
    case "lookup_schema":
      return `Looking up fields that measure ${quote(input.query)}`;
    case "query_data":
      return `Querying dataset ${input.dataset_id ?? ""}: ${quote(input.question)}`;
    case "federated_search":
      return `Searching ${quote(input.dataset)} for ${quote(input.search_text)} across nodes`;
    case "spatial_search":
      return `Finding where ${quote(input.scientific_name)} has been observed`;
    case "run_sparql":
      return "Querying the ontology";
    case "final_answer":
      return "Writing the answer";
    default:
      return action;
  }
};

/** Tables worth showing from the tool results: query_data and federated_search rows. */
const datasetResults = (
  observations: AskObservationEvent[]
): DatasetResult[] => {
  const results: DatasetResult[] = [];
  for (const obs of observations) {
    if (!obs.ok) continue;

    if (obs.action === "query_data") {
      const data = obs.data as unknown as SmartSearchResponse;
      if (!data?.answered || !data.dataset || !data.rows?.length) continue;
      results.push({
        key: `${obs.step}-query`,
        title: data.dataset.title,
        subtitle: data.interpretation,
        citation: data.dataset.citation,
        columns: data.columns,
        rows: data.rows,
        truncated: data.truncated,
      });
    }

    if (obs.action === "federated_search") {
      const body = obs.data as {
        fields?: string[];
        results?: Record<
          string,
          { field_results?: { results?: { results?: Record<string, SmartSearchCell>[] } } }
        >;
      };
      for (const [title, res] of Object.entries(body?.results ?? {})) {
        const rows = res?.field_results?.results?.results ?? [];
        if (!rows.length) continue;
        const columns = (body.fields?.length ? body.fields : Object.keys(rows[0])).filter(
          (c) => c !== "id"
        );
        results.push({
          key: `${obs.step}-fed-${title}`,
          title,
          subtitle: "Matching rows across nodes",
          columns,
          rows: rows.map((row) => columns.map((c) => row[c] ?? null)),
        });
      }
    }
  }
  return results;
};

export function DeepSearchResult({
  steps,
  observations,
  status,
  answer,
  error,
  isRunning,
  elapsed,
  onCancel,
}: {
  steps: AskStepEvent[];
  observations: AskObservationEvent[];
  status: string | null;
  answer: AskAnswerEvent | null;
  error: string | null;
  isRunning: boolean;
  elapsed: number;
  onCancel: () => void;
}) {
  const results = React.useMemo(
    () => datasetResults(observations),
    [observations]
  );
  const outcomeByStep = React.useMemo(
    () => new Map(observations.map((o) => [o.step, o.ok])),
    [observations]
  );

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      {/* Agent trace: one line per tool call, live while running */}
      {(isRunning || steps.length > 0) && (
        <div
          className="rounded-2xl border border-primary/20 bg-primary/[0.03] px-5 py-4"
          role="status"
          aria-live="polite"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles
                className={cn("h-4 w-4 text-primary", isRunning && "animate-pulse")}
                aria-hidden
              />
              {isRunning ? "Working across datasets…" : "How this was answered"}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] tabular-nums text-muted-foreground/80">
                {isRunning ? `${elapsed}s` : answer && `${answer.timings?.total_s ?? elapsed}s`}
              </span>
              {isRunning && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Stop
                </Button>
              )}
            </div>
          </div>

          <ol className="space-y-2">
            {steps.map((step) => {
              const ok = outcomeByStep.get(step.step);
              const isFinal = step.action === "final_answer";
              const pending = !isFinal && ok === undefined && isRunning;
              return (
                <li key={step.step} className="flex items-start gap-2 text-xs">
                  {pending ? (
                    <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin text-primary" />
                  ) : ok === false ? (
                    <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0">
                    <p className="text-foreground">{describeStep(step)}</p>
                    {step.thought && (
                      <p className="text-muted-foreground">{step.thought}</p>
                    )}
                  </div>
                </li>
              );
            })}
            {isRunning && (
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
                {status ??
                  (steps.length === 0
                    ? "Reading your question…"
                    : "Deciding what to look at next…")}
              </li>
            )}
          </ol>
        </div>
      )}

      {/* Error / stopped */}
      {error && !isRunning && (
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="rounded-xl border border-primary/15 bg-card/70 px-4 py-4 backdrop-blur-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {answer.answer}
          </p>
          {answer.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
              <span className="text-[11px] text-muted-foreground">Sources:</span>
              {answer.citations.map((c, i) => (
                <Badge
                  key={`${c.dataset_id}-${c.title}-${i}`}
                  variant="secondary"
                  className="text-[11px]"
                  title={c.citation ?? undefined}
                >
                  {c.title}
                  {typeof c.row_count === "number" && ` · ${c.row_count} rows`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data behind the answer, one card per dataset */}
      {results.map((result) => (
        <div key={result.key} className="space-y-2">
          <div className="rounded-xl border border-primary/10 bg-card/60 px-4 py-3 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Database className="size-4 text-primary" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {result.title}
              </span>
              <Badge variant="secondary" className="text-[11px]">
                {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
              </Badge>
              {result.truncated && (
                <Badge
                  variant="secondary"
                  className="text-[11px] text-amber-700 dark:text-amber-400"
                >
                  truncated
                </Badge>
              )}
            </div>
            {result.subtitle && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {result.subtitle}
              </p>
            )}
            {result.citation && (
              <p className="mt-1 text-xs text-muted-foreground/80">
                {result.citation}
              </p>
            )}
          </div>
          <SmartSearchResultTable columns={result.columns} rows={result.rows} />
        </div>
      ))}
    </div>
  );
}
