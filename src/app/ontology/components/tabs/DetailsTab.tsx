import React from "react";
import { MonoChip } from "../Chips";
import type { ClassDetail } from "../../types";
import { Typography } from "@/components/ui/typography";

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
        <Typography variant="caption" className="text-lead">{detail.label}</Typography>
      </Row>
      <Row label="Synonyms">
        {detail.synonyms.length ? (
          <span className="flex flex-wrap gap-2">
            {detail.synonyms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full bg-[#EFF0EA] px-3 py-1 text-compact leading-none text-[#4A4E46]"
              >
                {s}
              </span>
            ))}
          </span>
        ) : (
          <Typography variant="body" as="span" className="text-[#9AA093]">—</Typography>
        )}
      </Row>
      <Row label="Parent class">
        {detail.parent_name ? (
          <button type="button" onClick={() => onSelectClass(detail.parent_name as string)}>
            <MonoChip>{detail.parent_curie}</MonoChip>
          </button>
        ) : (
          <Typography variant="body" as="span" className="text-[#9AA093]">Top-level class</Typography>
        )}
      </Row>
      <Row label="Definition">
        <Typography variant="caption" className="block max-w-[560px] text-lead leading-[1.55]">
          {detail.definition || <Typography variant="body" as="span" className="text-[#9AA093]">—</Typography>}
        </Typography>
      </Row>
      {/* Only a predefined class has a resolvable IRI; a draft gets one when published. */}
      {detail.iri && (
        <Row label="IRI">
          <Typography variant="mono" as="span" className="block max-w-[560px] break-all leading-[1.6] text-[#5C6058]">
            {detail.iri}
          </Typography>
        </Row>
      )}
    </dl>
  );
}
