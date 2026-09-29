import React from "react";
import { History } from "lucide-react";
import { StatusChip } from "./Chips";
import { primaryButtonClass, secondaryButtonClass } from "../constants";
import type { BuilderAction } from "../types";
import type { OntologyListItem, PredefinedSummary } from "../apiTypes";
import { predefinedCaption, relativeTime } from "../utils";

interface Props {
  ontology: OntologyListItem | null;
  latestVersion: number | null;
  /** A predefined vocabulary cannot be validated, versioned or published. */
  readOnly: boolean;
  /** Only present for a predefined ontology — the source of its counts. */
  summary: PredefinedSummary | null;
  busy: BuilderAction | null;
  notice: string | null;
  onDismissNotice: () => void;
  onNewOntology: () => void;
  onAction: (kind: BuilderAction) => void;
  onHome: () => void;
}

export default function BuilderHeader({
  ontology,
  latestVersion,
  readOnly,
  summary,
  busy,
  notice,
  onDismissNotice,
  onNewOntology,
  onAction,
  onHome,
}: Props) {
  return (
    <div className="shrink-0 border-b border-[#E6E6DE] bg-white">
      <div className="flex h-[54px] items-center gap-2 px-6">
        <button type="button" className="text-sm text-[#6E7268] hover:text-[#26292A]" onClick={onHome}>
          My Ontologies
        </button>
        <span className="text-sm text-[#BFC2B8]">/</span>
        <span className="text-sm text-[#6E7268]">{ontology?.title ?? "—"}</span>

        <h1 className="ml-4 text-[24px] font-bold leading-none tracking-[-0.01em]">{ontology?.title ?? ""}</h1>
        {ontology && (
          <>
            {ontology.acronym && (
              <span className="inline-flex items-center rounded bg-[#EDEEE8] px-2 py-1 text-xs leading-none text-[#6B6F66]">
                {ontology.acronym}
              </span>
            )}
            <StatusChip status={ontology.status} />
            <span className="ml-3 text-[13px] text-[#8A8E84]">
              {/* A predefined vocabulary has no publish history, so show its size instead. */}
              {readOnly
                ? summary
                  ? predefinedCaption(summary)
                  : "Predefined vocabulary"
                : ontology.last_published_at
                  ? `Last published v${latestVersion ?? 1} · ${relativeTime(ontology.last_published_at)}`
                  : "Never published"}
              {" · graph_key "}
              <span className="font-mono text-xs text-[#6E7268]">{ontology.graph_key}</span>
            </span>
          </>
        )}
      </div>

      <div className="flex h-[52px] items-center gap-2 px-6 pb-2">
        <button
          type="button"
          onClick={onNewOntology}
          className="rounded px-2 py-2 text-sm text-[#4A5A4E] hover:bg-[#F1F3EE]"
        >
          + New ontology
        </button>
        <button type="button" disabled={busy !== null || !ontology || readOnly} onClick={() => onAction("validate")} className={secondaryButtonClass}>
          {busy === "validate" ? "Validating…" : "Validate"}
        </button>
        <button
          type="button"
          disabled={busy !== null || !ontology || readOnly}
          onClick={() => onAction("version")}
          className={`inline-flex items-center gap-1.5 ${secondaryButtonClass}`}
        >
          <History size={14} strokeWidth={1.8} />
          {busy === "version" ? "Saving…" : "New version"}
        </button>
        <button
          type="button"
          disabled={busy !== null || !ontology || readOnly}
          onClick={() => onAction("publish")}
          className={`${primaryButtonClass} disabled:opacity-60`}
        >
          {busy === "publish" ? "Publishing…" : "Publish"}
        </button>
        {notice && (
          <button type="button" className="ml-3 truncate text-[13px] text-[#6E7268]" onClick={onDismissNotice}>
            {notice}
          </button>
        )}
      </div>
    </div>
  );
}
