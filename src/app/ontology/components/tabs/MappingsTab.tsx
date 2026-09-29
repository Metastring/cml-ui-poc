"use client";

import React, { useState } from "react";
import { MonoChip, SectionHeading } from "../Chips";
import { MAPPING_RELATIONS, MAPPING_TARGET_KINDS, prefixedName } from "../../apiTypes";
import type { MappingRelation, MappingTargetKind, OntologyListItem, OntologyMapping } from "../../apiTypes";
import { fieldLabelClass, inputClass, linkButtonClass, primaryButtonClass, quietButtonClass } from "../../constants";
import type { ClassDetail, MappingFormState } from "../../types";
import { ontologyLabel } from "../../utils";

/** The right-hand caption on a mapping row, which depends on the target kind. */
function targetCaption(m: OntologyMapping, ontologies: OntologyListItem[]) {
  if (m.target_kind === "external_ontology") return `in ${ontologyLabel(ontologies, m.to_ontology_graph_key)}`;
  if (m.target_kind === "internal") return "in this ontology";
  return "external term";
}

function targetText(m: OntologyMapping) {
  if (m.target_kind === "internal") return prefixedName(m.to_class_name ?? "");
  if (m.target_kind === "external_ontology") return prefixedName(m.to_ref ?? "");
  return m.to_ref;
}

function AddMappingForm({
  form,
  className,
  classNames,
  ontologies,
  graphKey,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: MappingFormState;
  className: string;
  classNames: string[];
  ontologies: OntologyListItem[];
  graphKey: string | null;
  onChange: (next: MappingFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const targetLabel =
    form.target_kind === "internal"
      ? "Class in this ontology"
      : form.target_kind === "external_ontology"
        ? "Ontology & class"
        : "CURIE or URI";

  return (
    <div className="mt-6 rounded-md border border-dashed border-[#CFD3C8] bg-[#FCFCF9] p-5">
      <h4 className="mb-4 text-xs uppercase tracking-[0.09em] text-[#6E7268]">Add mapping</h4>
      <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-4">
        <div>
          <label className={fieldLabelClass}>Relation</label>
          <select
            value={form.relation}
            onChange={(e) => onChange({ ...form, relation: e.target.value as MappingRelation })}
            className={inputClass}
          >
            {MAPPING_RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabelClass}>Target</label>
          <select
            value={form.target_kind}
            onChange={(e) => onChange({ ...form, target_kind: e.target.value as MappingTargetKind })}
            className={inputClass}
          >
            {MAPPING_TARGET_KINDS.map((k) => (
              <option key={k} value={k}>{k.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={fieldLabelClass}>{targetLabel}</label>
          {form.target_kind === "internal" ? (
            <select
              value={form.to_class_name}
              onChange={(e) => onChange({ ...form, to_class_name: e.target.value })}
              className={inputClass}
            >
              {classNames.filter((c) => c !== className).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : form.target_kind === "external_ontology" ? (
            <div className="flex gap-2">
              <select
                value={form.to_ontology_graph_key}
                onChange={(e) => onChange({ ...form, to_ontology_graph_key: e.target.value })}
                className={inputClass}
              >
                <option value="">Select ontology…</option>
                {ontologies.filter((o) => o.graph_key !== graphKey).map((o) => (
                  <option key={o.graph_key} value={o.graph_key}>{o.acronym ?? o.title}</option>
                ))}
              </select>
              <input
                value={form.to_ref}
                onChange={(e) => onChange({ ...form, to_ref: e.target.value })}
                placeholder="ClassName"
                className={inputClass}
              />
            </div>
          ) : (
            <input
              value={form.to_ref}
              onChange={(e) => onChange({ ...form, to_ref: e.target.value })}
              placeholder="dwc:Taxon"
              className={inputClass}
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button type="button" onClick={onCancel} className={quietButtonClass}>
          Cancel
        </button>
        <button type="button" onClick={onSubmit} className={primaryButtonClass}>
          Add mapping
        </button>
      </div>
    </div>
  );
}

export default function MappingsTab({
  detail,
  ontologies,
  graphKey,
  readOnly,
  classNames,
  onCreate,
  onDelete,
}: {
  detail: ClassDetail;
  ontologies: OntologyListItem[];
  graphKey: string | null;
  readOnly: boolean;
  classNames: string[];
  onCreate: (input: MappingFormState) => Promise<boolean>;
  onDelete: (mappingId: number) => void;
}) {
  const [form, setForm] = useState<MappingFormState | null>(null);

  const openForm = () =>
    setForm({
      relation: "skos:closeMatch",
      target_kind: "internal",
      to_class_name: classNames.find((c) => c !== detail.name) ?? "",
      to_ontology_graph_key: "",
      to_ref: "",
    });

  const submit = async () => {
    if (!form) return;
    if (await onCreate(form)) setForm(null);
  };

  return (
    <div className="px-6 py-7">
      <SectionHeading
        title="Mapped to"
        action={
          readOnly ? undefined : (
            <button type="button" className={linkButtonClass} onClick={openForm}>
              + Add mapping
            </button>
          )
        }
      />

      <div className="space-y-2">
        {detail.mappings.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-md border border-[#E6E6DE] px-4 py-3">
            <MonoChip>{m.relation}</MonoChip>
            <span className="text-[#9AA093]">→</span>
            <span className="font-mono text-sm font-semibold text-[#24503A]">{targetText(m)}</span>
            <span className="text-[13px] text-[#8A8E84]">{targetCaption(m, ontologies)}</span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onDelete(m.id)}
                className="ml-auto text-[13px] text-[#9AA093] hover:text-[#8A4A4A]"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 max-w-[760px] text-[13px] italic leading-[1.6] text-[#9AA093]">
        {readOnly ? (
          /* The predefined readers don't expose class mappings at all. */
          <>Mappings are only available for ontologies built here.</>
        ) : (
          <>
            {detail.mappings.length ? "No other mappings yet." : "No mappings yet."} Use a mapping to align{" "}
            {detail.name} with a class in this ontology, another ontology, or an external term — instead of
            giving it a second parent.
          </>
        )}
      </p>

      {form && (
        <AddMappingForm
          form={form}
          className={detail.name}
          classNames={classNames}
          ontologies={ontologies}
          graphKey={graphKey}
          onChange={setForm}
          onCancel={() => setForm(null)}
          onSubmit={() => void submit()}
        />
      )}
    </div>
  );
}
