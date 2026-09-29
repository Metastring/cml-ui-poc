import React from "react";
import { MonoChip } from "../Chips";
import type { ClassDetail } from "../../types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start">
      <dt className="w-[170px] shrink-0 pt-[3px] text-xs uppercase tracking-[0.09em] text-[#8A8E84]">{label}</dt>
      <dd className="flex-1">{children}</dd>
    </div>
  );
}

export default function DetailsTab({
  detail,
  onSelectClass,
}: {
  detail: ClassDetail;
  onSelectClass: (name: string) => void;
}) {
  return (
    <dl className="space-y-6 px-6 py-7">
      <Row label="Preferred label">
        <span className="text-[15px]">{detail.label}</span>
      </Row>
      <Row label="Synonyms">
        {detail.synonyms.length ? (
          <span className="flex flex-wrap gap-2">
            {detail.synonyms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full bg-[#EFF0EA] px-3 py-1 text-[13px] leading-none text-[#4A4E46]"
              >
                {s}
              </span>
            ))}
          </span>
        ) : (
          <span className="text-sm text-[#9AA093]">—</span>
        )}
      </Row>
      <Row label="Parent class">
        {detail.parent_name ? (
          <button type="button" onClick={() => onSelectClass(detail.parent_name as string)}>
            <MonoChip>{detail.parent_curie}</MonoChip>
          </button>
        ) : (
          <span className="text-sm text-[#9AA093]">Top-level class</span>
        )}
      </Row>
      <Row label="Definition">
        <span className="block max-w-[560px] text-[15px] leading-[1.55]">
          {detail.definition || <span className="text-sm text-[#9AA093]">—</span>}
        </span>
      </Row>
      {/* Only a predefined class has a resolvable IRI; a draft gets one when published. */}
      {detail.iri && (
        <Row label="IRI">
          <span className="block max-w-[560px] break-all font-mono text-xs leading-[1.6] text-[#5C6058]">
            {detail.iri}
          </span>
        </Row>
      )}
    </dl>
  );
}
