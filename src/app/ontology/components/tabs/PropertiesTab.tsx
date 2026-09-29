"use client";

import React, { useState } from "react";
import { SectionHeading } from "../Chips";
import { DATATYPE_RANGES } from "../../apiTypes";
import { fieldLabelClass, inputClass, linkButtonClass, primaryButtonClass, quietButtonClass } from "../../constants";
import type { ClassDetail, PropertyFormState, TaggedProperty } from "../../types";

function PropertyTable({
  title,
  rows,
  emptyText,
  readOnly,
  onAdd,
}: {
  title: string;
  rows: TaggedProperty[];
  emptyText: string;
  readOnly: boolean;
  onAdd: () => void;
}) {
  return (
    <div>
      <SectionHeading
        title={title}
        action={
          readOnly ? undefined : (
            <button type="button" className={linkButtonClass} onClick={onAdd}>
              + Add
            </button>
          )
        }
      />
      {rows.length === 0 ? (
        <p className="py-3 text-sm text-[#9AA093]">{emptyText}</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#E6E6DE] text-left text-xs uppercase tracking-[0.09em] text-[#8A8E84]">
              <th className="py-2 pr-4 font-normal">Name</th>
              <th className="w-[220px] py-2 pr-4 font-normal">Range</th>
              <th className="w-[160px] py-2 font-normal">Cardinality</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.name} className="border-b border-[#F0F0EA]">
                <td className="py-3 pr-4">
                  <span className="font-mono text-sm font-semibold text-[#26292A]">{p.name}</span>
                  {p.inherited_from && (
                    <span className="ml-2 inline-flex items-center rounded bg-[#EFF0EA] px-2 py-0.5 font-mono text-[11px] text-[#7E8278]">
                      from {p.inherited_from}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center rounded border border-[#DCE4DD] bg-[#F1F6F1] px-2 py-1 font-mono text-xs text-[#2F5C42]">
                    {p.range_value}
                  </span>
                </td>
                <td className="py-3 text-[#4A4E46]">{p.cardinality_note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AddPropertyForm({
  form,
  classNames,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: PropertyFormState;
  classNames: string[];
  onChange: (next: PropertyFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-6 rounded-md border border-dashed border-[#CFD3C8] bg-[#FCFCF9] p-5">
      <h4 className="mb-4 text-xs uppercase tracking-[0.09em] text-[#6E7268]">Add {form.kind} property</h4>
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
        <div>
          <label className={fieldLabelClass}>Name</label>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="preparedFrom"
            className={inputClass}
          />
        </div>
        <div>
          <label className={fieldLabelClass}>
            {form.kind === "object" ? "Range (class in this ontology)" : "Range"}
          </label>
          <select
            value={form.range}
            onChange={(e) => onChange({ ...form, range: e.target.value })}
            className={inputClass}
          >
            {form.kind === "object"
              ? classNames.map((c) => <option key={c} value={c}>{c}</option>)
              : DATATYPE_RANGES.map((d) => <option key={d} value={`xsd:${d}`}>{`xsd:${d}`}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabelClass}>Cardinality</label>
          <input
            value={form.cardinality}
            onChange={(e) => onChange({ ...form, cardinality: e.target.value })}
            placeholder="0..many"
            className={inputClass}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button type="button" onClick={onCancel} className={quietButtonClass}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!form.name.trim() || !form.range}
          onClick={onSubmit}
          className={primaryButtonClass}
        >
          Add property
        </button>
      </div>
    </div>
  );
}

export default function PropertiesTab({
  detail,
  readOnly,
  classNames,
  onCreate,
}: {
  detail: ClassDetail;
  readOnly: boolean;
  classNames: string[];
  onCreate: (input: PropertyFormState) => Promise<boolean>;
}) {
  const [form, setForm] = useState<PropertyFormState | null>(null);

  const submit = async () => {
    if (!form) return;
    if (await onCreate(form)) setForm(null);
  };

  return (
    <div className="px-6 py-7">
      <PropertyTable
        title="Datatype properties"
        rows={detail.datatype_properties}
        emptyText="No datatype properties on this class."
        readOnly={readOnly}
        onAdd={() => setForm({ kind: "datatype", name: "", range: "xsd:string", cardinality: "0..1" })}
      />
      <div className="mt-8">
        <PropertyTable
          title="Object properties"
          rows={detail.object_properties}
          emptyText="No object properties on this class."
          readOnly={readOnly}
          onAdd={() => setForm({ kind: "object", name: "", range: classNames[0] ?? "", cardinality: "0..many" })}
        />
      </div>

      {form && (
        <AddPropertyForm
          form={form}
          classNames={classNames}
          onChange={setForm}
          onCancel={() => setForm(null)}
          onSubmit={() => void submit()}
        />
      )}
    </div>
  );
}
