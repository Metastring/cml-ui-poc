import React from "react";
import { StatusChip } from "./Chips";
import { paneHeaderClass } from "../constants";
import type { OntologyListItem } from "../apiTypes";
import { railTitle } from "../utils";

interface Props {
  ontologies: OntologyListItem[];
  graphKey: string | null;
  onSelect: (graphKey: string) => void;
}

export default function OntologyRail({ ontologies, graphKey, onSelect }: Props) {
  /* The catalogue holds both kinds. The predefined ones are read-only, so they
     get their own label rather than sitting under "My Ontologies". */
  const mine = ontologies.filter((o) => o.source !== "predefined");
  const predefined = ontologies.filter((o) => o.source === "predefined");

  const row = (o: OntologyListItem) => {
    const active = o.graph_key === graphKey;
    return (
      <button
        key={o.graph_key}
        type="button"
        onClick={() => onSelect(o.graph_key)}
        className={`flex w-full flex-col gap-1 border-l-[3px] px-4 py-3 text-left ${
          active ? "border-[#4A7C59] bg-[#EDF2EA]" : "border-transparent hover:bg-[#F5F6F2]"
        }`}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold leading-[1.35]">{railTitle(o.title)}</span>
          <StatusChip status={o.status} />
        </span>
        {/* A predefined entry has no acronym to show. */}
        {o.acronym && <span className="text-xs text-[#8A8E84]">{o.acronym}</span>}
      </button>
    );
  };

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-[#E6E6DE] bg-white">
      <div className={paneHeaderClass}>My Ontologies</div>
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {mine.length === 0 && (
          <p className="px-4 py-3 text-xs leading-[1.5] text-[#8A8E84]">
            No ontologies yet. Use <span className="text-[#4A5A4E]">+ New ontology</span> to create one.
          </p>
        )}
        {mine.map(row)}

        {predefined.length > 0 && (
          <>
            <div className="mt-2 border-t border-[#E6E6DE] px-4 pb-1 pt-3 text-xs uppercase tracking-[0.09em] text-[#8A8E84]">
              Predefined
            </div>
            {predefined.map(row)}
          </>
        )}
      </div>
    </aside>
  );
}
