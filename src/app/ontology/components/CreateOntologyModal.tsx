"use client";

import React, { useState } from "react";
import { api } from "../api/ontologyApi";
import { STATUS_OPTIONS, VISIBILITY_OPTIONS, slugifyGraphKey } from "../apiTypes";
import type { OntologyStatus, Visibility } from "../apiTypes";
import { fieldLabelClass, inputClass, quietButtonClass } from "../constants";
import { errorMessage } from "../utils";

interface Props {
  onCancel: () => void;
  onCreated: (graphKey: string) => void | Promise<void>;
}

export default function CreateOntologyModal({ onCancel, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [acronym, setAcronym] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("Public");
  const [status, setStatus] = useState<OntologyStatus>("Staging");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryDraft, setCategoryDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const commitCategory = () => {
    const v = (categoryDraft ?? "").trim();
    if (v && !categories.includes(v)) setCategories([...categories, v]);
    setCategoryDraft(null);
  };

  const submit = async () => {
    setError(null);
    setSaving(true);
    try {
      const o = await api.createOntology({
        graph_key: slugifyGraphKey(title),
        title: title.trim(),
        acronym: acronym.trim().toUpperCase(),
        visibility,
        status,
        description: description.trim(),
        categories,
      });
      await onCreated(o.graph_key);
    } catch (e) {
      setError(errorMessage(e, "Could not create ontology"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#26292A]/25 px-4 pt-14">
      <div className="w-full max-w-[560px] rounded-md bg-white p-8 shadow-xl">
        <h2 className="text-[22px] font-bold leading-none tracking-[-0.01em]">Create ontology</h2>
        <p className="mt-3 text-sm text-[#6E7268]">
          Step 1 of 3 — details first, then you&apos;ll build the class tree.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className={fieldLabelClass}>Name</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Siddha Materia Medica"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={fieldLabelClass}>Acronym</label>
              <input
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
                placeholder="e.g. SID"
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabelClass}>Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                className={inputClass}
              >
                {VISIBILITY_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={fieldLabelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OntologyStatus)}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={fieldLabelClass}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this ontology covers…"
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label className={fieldLabelClass}>Categories</label>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF0EA] px-3 py-1.5 text-[13px] leading-none text-[#4A4E46]"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => setCategories(categories.filter((x) => x !== c))}
                    className="text-[#8A8E84] hover:text-[#26292A]"
                  >
                    ×
                  </button>
                </span>
              ))}
              {categoryDraft === null ? (
                <button
                  type="button"
                  onClick={() => setCategoryDraft("")}
                  className="inline-flex items-center rounded-full border border-[#D8D9D0] px-3 py-1.5 text-[13px] leading-none text-[#5C6058] hover:bg-[#F5F6F2]"
                >
                  + Add
                </button>
              ) : (
                <input
                  autoFocus
                  value={categoryDraft}
                  onChange={(e) => setCategoryDraft(e.target.value)}
                  onBlur={commitCategory}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setCategoryDraft(null);
                  }}
                  placeholder="Category"
                  className="w-[140px] rounded-full border border-[#D8D9D0] px-3 py-1.5 text-[13px] outline-none focus:border-[#4A7C59]"
                />
              )}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-[13px] text-[#8A4A4A]">{error}</p>}

        <div className="mt-7 flex items-center justify-end gap-5">
          <button type="button" onClick={onCancel} className={quietButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!title.trim() || !acronym.trim() || saving}
            onClick={() => void submit()}
            className="rounded bg-[#1E5B44] px-5 py-2.5 text-sm text-white hover:bg-[#194B39] disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create & continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
