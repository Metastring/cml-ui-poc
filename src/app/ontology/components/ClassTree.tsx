"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TREE_INDENT, inputClass, paneHeaderClass } from "../constants";
import type { ClassSearchHit, TreeRow } from "../types";

interface Props {
  rows: TreeRow[];
  expanded: Set<string>;
  selectedClass: string | null;
  /** A predefined ontology cannot be edited, so the add rows are hidden. */
  readOnly: boolean;
  loading: boolean;
  /** Why the tree is empty, when that is expected (a vocabulary has no classes). */
  hint: string | null;
  /**
   * Search is predefined-only (guide §3.5) — there is no endpoint for drafts.
   * While `hits` is non-null the flat result list replaces the tree.
   */
  search: {
    enabled: boolean;
    query: string;
    hits: ClassSearchHit[] | null;
    onQueryChange: (q: string) => void;
  };
  onSelect: (name: string) => void;
  onToggle: (name: string) => void;
  onCreate: (name: string, parent: string | null) => void;
}

const indentFor = (depth: number) => 4 + depth * TREE_INDENT;

/** The faint vertical line that links a parent to its children. */
function Guide({ depth }: { depth: number }) {
  if (depth === 0) return null;
  return (
    <span
      className="pointer-events-none absolute bottom-0 top-0 w-px bg-[#EAEBE4]"
      style={{ left: indentFor(depth - 1) + 11 }}
    />
  );
}

export default function ClassTree({
  rows,
  expanded,
  selectedClass,
  readOnly,
  loading,
  hint,
  search,
  onSelect,
  onToggle,
  onCreate,
}: Props) {
  /** Which parent has an open inline input: `null` = top level, `undefined` = none. */
  const [addingUnder, setAddingUnder] = useState<string | null | undefined>(undefined);
  const [draftName, setDraftName] = useState("");

  const closeDraft = () => {
    setAddingUnder(undefined);
    setDraftName("");
  };

  const submit = (parent: string | null) => {
    const name = draftName.trim();
    if (name) onCreate(name, parent);
    closeDraft();
  };

  const draftInput = (parent: string | null, placeholder: string) => (
    <input
      autoFocus
      value={draftName}
      onChange={(e) => setDraftName(e.target.value)}
      onBlur={() => submit(parent)}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit(parent);
        if (e.key === "Escape") closeDraft();
      }}
      placeholder={placeholder}
      className="w-full rounded border border-[#D8D9D0] px-2 py-1.5 text-sm outline-none focus:border-[#4A7C59]"
    />
  );

  /* A search result list is flat, so it replaces the tree rather than filtering it. */
  const hits = search.hits;

  return (
    <section className="flex w-[296px] shrink-0 flex-col border-r border-[#E6E6DE] bg-white">
      <div className={paneHeaderClass}>Classes</div>

      {search.enabled && (
        <div className="shrink-0 border-b border-[#E6E6DE] px-3 py-2">
          <input
            value={search.query}
            onChange={(e) => search.onQueryChange(e.target.value)}
            placeholder="Search classes…"
            className={inputClass}
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto py-3 pl-3 pr-2">
        {loading && <p className="px-2 py-2 text-sm text-[#9AA093]">Loading…</p>}

        {hint && !loading && (
          <p className="px-2 py-2 text-xs leading-[1.6] text-[#8A8E84]">{hint}</p>
        )}

        {hits !== null ? (
          hits.length === 0 ? (
            <p className="px-2 py-2 text-sm text-[#9AA093]">No classes match “{search.query}”.</p>
          ) : (
            hits.map((h) => (
              <div
                key={h.name}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(h.name)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(h.name)}
                className={`cursor-pointer rounded px-2 py-1.5 text-sm ${
                  h.name === selectedClass ? "bg-[#E7EFE6] font-medium" : "hover:bg-[#F5F6F2]"
                }`}
              >
                <span className="block truncate">{h.name}</span>
                {h.label !== h.name && (
                  <span className="block truncate text-xs text-[#8A8E84]">{h.label}</span>
                )}
              </div>
            ))
          )
        ) : (
          <>
            {!readOnly &&
              (addingUnder === null ? (
                <div className="mb-1">{draftInput(null, "ClassName")}</div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingUnder(null)}
                  className="mb-1 block w-full rounded px-3 py-1 text-left text-sm text-[#7E8278] hover:text-[#4A7C59]"
                >
                  + Add top-level class
                </button>
              ))}

            {rows.map((row) => {
          if (row.kind === "add") {
            return (
              <div key={`add-${row.parent}`} className="relative">
                <Guide depth={row.depth} />
                {addingUnder === row.parent ? (
                  <div className="my-1" style={{ paddingLeft: indentFor(row.depth) + 22 }}>
                    {draftInput(row.parent, "SubclassName")}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingUnder(row.parent)}
                    className="block py-1.5 text-left text-sm text-[#7E8278] hover:text-[#4A7C59]"
                    style={{ paddingLeft: indentFor(row.depth) + 22 }}
                  >
                    + Add subclass
                  </button>
                )}
              </div>
            );
          }

          const { node } = row;
          const active = node.name === selectedClass;
          const isOpen = expanded.has(node.name);
          return (
            <div key={node.name} className="relative">
              <Guide depth={row.depth} />
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(node.name)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(node.name)}
                className={`flex cursor-pointer items-center gap-1.5 rounded py-1.5 pr-2 text-sm ${
                  active ? "bg-[#E7EFE6] font-medium" : "hover:bg-[#F5F6F2]"
                }`}
                style={{ paddingLeft: indentFor(row.depth) }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center text-[#8A8E84]"
                  onClick={(e) => {
                    if (!node.has_children) return;
                    e.stopPropagation();
                    onToggle(node.name);
                  }}
                >
                  {node.has_children ? (
                    isOpen ? <ChevronDown size={13} strokeWidth={2.2} /> : <ChevronRight size={13} strokeWidth={2.2} />
                  ) : row.depth === 0 ? (
                    <span className="h-[1px] w-[5px] bg-[#C9CCC2]" />
                  ) : null}
                </span>
                <span
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: active ? "#3F6B4C" : "#B9BDB2" }}
                />
                <span className="truncate">{node.name}</span>
              </div>
            </div>
          );
            })}
          </>
        )}
      </div>
    </section>
  );
}
