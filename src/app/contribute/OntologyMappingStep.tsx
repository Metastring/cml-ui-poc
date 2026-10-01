"use client";

import React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MappingField,
  OntologyFieldOption,
  OntologyOption,
} from "@/types/app/contribute.types";
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Badge,
  Btn,
  BtnRow,
  CardHead,
  CheckIcon,
  ChevronDownIcon,
  NodePill,
  SelectField,
  controlClassName,
} from "./RegistrationUI";

/** The per-field details the mappings payload carries beside the term itself. */
const DETAIL_FIELDS: {
  label: string;
  placeholder: string;
  mono?: boolean;
  read: (field: MappingField) => string;
  patch: (value: string) => Partial<MappingField>;
}[] = [
  {
    label: "Ontology URI (optional)",
    placeholder: "https://… if you know it",
    mono: true,
    read: (field) => field.ontology_uri ?? "",
    patch: (ontology_uri) => ({ ontology_uri }),
  },
  {
    label: "Label",
    placeholder: "What you call this field",
    read: (field) => field.label ?? "",
    patch: (label) => ({ label }),
  },
  {
    label: "Value range",
    placeholder: "0–500",
    mono: true,
    read: (field) => field.value_range ?? "",
    patch: (value_range) => ({ value_range }),
  },
];

interface OntologyMappingStepProps {
  location: string;
  fields: MappingField[];
  ontologies: OntologyOption[];
  ontologyGraphKey: string;
  ontologyOptions: OntologyFieldOption[];
  isLoadingPreview: boolean;
  previewError: string | null;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onChangeOntology: (graphKey: string) => void;
  onChangeField: (id: string, patch: Partial<MappingField>) => void;
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const OntologyMappingStep: React.FC<OntologyMappingStepProps> = ({
  location,
  fields,
  ontologies,
  ontologyGraphKey,
  ontologyOptions,
  isLoadingPreview,
  previewError,
  isSubmitting,
  isSavingDraft,
  onChangeOntology,
  onChangeField,
  onAddField,
  onRemoveField,
  onBack,
  onSaveDraft,
  onContinue,
}) => {
  /* An untouched open row isn't a field yet, so it stays out of the counts. */
  const namedFields = fields.filter((f) => f.field_name.trim());
  const autoMapped = namedFields.filter((f) => f.auto && f.ontology_term).length;
  const needReview = namedFields.filter(
    (f) => !f.ontology_term && !f.ontology_uri
  ).length;

  return (
    <div>
      <CardHead title="Step 3 — Ontology mapping">
        We fetched a schema preview from{" "}
        <b className="font-bold text-foreground">
          {location || "your registered data reference"}
        </b>{" "}
        — just column headers and sample values, not the underlying records — and
        matched most of them to CML ontology terms already. Review the
        suggestions, fix anything that looks off, and map the rest.
      </CardHead>

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <label
          htmlFor="ontology-graph-key"
          className="text-[11px] font-bold uppercase tracking-[0.03em] text-muted-foreground"
        >
          Ontology
        </label>
        <SelectField
          id="ontology-graph-key"
          value={ontologyGraphKey}
          onChange={(e) => onChangeOntology(e.target.value)}
          className="w-auto py-[7px] text-[12.5px]"
        >
          {!ontologies.some(
            (ontology) => ontology.graph_key === ontologyGraphKey
          ) && <option value={ontologyGraphKey}>{ontologyGraphKey}</option>}
          {ontologies.map((ontology) => (
            <option key={ontology.graph_key} value={ontology.graph_key}>
              {ontology.title}
            </option>
          ))}
        </SelectField>
        <span className="text-[11.5px] text-muted-foreground">
          Switching ontologies clears the terms already picked.
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Badge tone="success">{autoMapped} auto-mapped</Badge>
        <Badge tone="warn">{needReview} need review</Badge>
        <Badge tone="neutral">{namedFields.length} total fields</Badge>
        <span className="ml-auto">
          <NodePill>Reading live from source node — no data cached</NodePill>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                { label: "Detected field", width: "22%" },
                { label: "Sample value", width: "20%" },
                { label: "", width: "8%" },
                { label: "Ontology term", width: "34%" },
                { label: "Status", width: "16%" },
              ].map((column, index) => (
                <th
                  key={index}
                  style={{ width: column.width }}
                  className="border-b border-border px-2.5 pb-2 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-muted-foreground"
                >
                  {column.label || " "}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoadingPreview && (
              <tr>
                <td
                  colSpan={5}
                  className="px-2.5 py-6 text-[12.5px] text-muted-foreground"
                >
                  Reading the header from your source node…
                </td>
              </tr>
            )}

            {!isLoadingPreview && previewError && (
              <tr>
                <td
                  colSpan={5}
                  className="px-2.5 py-6 text-[12.5px] text-muted-foreground"
                >
                  {previewError} You can still map this dataset by adding its
                  fields below.
                </td>
              </tr>
            )}

            {!isLoadingPreview &&
              fields.map((field) => {
                /* A field outside the ontology is mapped by its URI alone. */
                const mapped = Boolean(field.ontology_term || field.ontology_uri);
                /* Only a field the user added has to be described by hand. */
                const needsDetails = field.added_manually;

                return (
                  <React.Fragment key={field.id}>
                    <tr
                      className={cn(
                        "dark:border-white/5",
                        !needsDetails && "border-b border-[#f0f0f0]"
                      )}
                    >
                      <td className="px-2.5 py-2.5 align-middle">
                        {needsDetails ? (
                          <input
                            value={field.field_name}
                            placeholder="Field name"
                            onChange={(e) =>
                              onChangeField(field.id, {
                                field_name: e.target.value,
                              })
                            }
                            className={cn(
                              controlClassName,
                              "py-[7px] text-[12.5px] font-bold"
                            )}
                          />
                        ) : (
                          <span className="text-[12.5px] font-bold text-foreground">
                            {field.field_name}
                          </span>
                        )}
                      </td>

                      <td className="px-2.5 py-2.5 align-middle">
                        {needsDetails ? (
                          <input
                            value={field.sample_value}
                            placeholder="Sample value"
                            onChange={(e) =>
                              onChangeField(field.id, {
                                sample_value: e.target.value,
                              })
                            }
                            className={cn(
                              controlClassName,
                              "py-[7px] font-mono text-[11.5px]"
                            )}
                          />
                        ) : (
                          <span className="font-mono text-[11.5px] text-muted-foreground">
                            {field.sample_value || "—"}
                          </span>
                        )}
                      </td>

                      <td className="px-2.5 py-2.5 align-middle text-muted-foreground">
                        <ArrowRightIcon size={14} />
                      </td>

                      <td className="px-2.5 py-2.5 align-middle">
                        <div className="relative">
                          <select
                            value={field.ontology_term}
                            onChange={(e) =>
                              onChangeField(field.id, {
                                ontology_term: e.target.value,
                                auto: false,
                              })
                            }
                            className={cn(
                              "w-full appearance-none rounded-md border py-[7px] pl-2.5 pr-[62px] text-[12.5px] outline-none transition-colors",
                              mapped
                                ? "border-input bg-card text-foreground"
                                : "border-[#fde68a] bg-[#fffbeb] text-muted-foreground dark:border-amber-900 dark:bg-amber-950/30"
                            )}
                          >
                            <option value="">Select ontology term…</option>
                            {field.ontology_term &&
                              !ontologyOptions.some(
                                (option) => option.value === field.ontology_term
                              ) && (
                                <option value={field.ontology_term}>
                                  {field.ontology_term}
                                </option>
                              )}
                            {ontologyOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                            {field.auto && mapped ? (
                              <Badge tone="info">auto</Badge>
                            ) : (
                              <span className="text-muted-foreground">
                                <ChevronDownIcon />
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-2.5 py-2.5 align-middle">
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full",
                            mapped
                              ? "bg-[#f0fdf4] text-[#16a34a] dark:bg-emerald-950/40"
                              : "bg-[#fffbeb] text-[#b45309] dark:bg-amber-950/40"
                          )}
                        >
                          {mapped ? <CheckIcon /> : <AlertIcon />}
                        </span>
                      </td>
                    </tr>

                    {needsDetails && (
                      <tr className="border-b border-[#f0f0f0] last:border-b-0 dark:border-white/5">
                        <td colSpan={5} className="px-2.5 pb-3">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => onRemoveField(field.id)}
                                aria-label="Remove this field"
                                title="Remove this field"
                                className="ml-auto flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"
                              >
                                <XIcon size={13} />
                                Remove
                              </button>
                            </div>

                            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                              {DETAIL_FIELDS.map((detail) => (
                                <label key={detail.label} className="block">
                                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.03em] text-muted-foreground">
                                    {detail.label}
                                  </span>
                                  <input
                                    value={detail.read(field)}
                                    placeholder={detail.placeholder}
                                    onChange={(e) =>
                                      onChangeField(
                                        field.id,
                                        detail.patch(e.target.value)
                                      )
                                    }
                                    className={cn(
                                      controlClassName,
                                      "py-[7px] text-[12.5px]",
                                      detail.mono && "font-mono text-[11.5px]"
                                    )}
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <Btn onClick={onAddField} className="px-3 py-[7px] text-[12px]">
          + Add new field
        </Btn>
      </div>

      <BtnRow
        left={
          <Btn onClick={onBack}>
            <ArrowLeftIcon />
            Back
          </Btn>
        }
      >
        <Btn onClick={onSaveDraft} disabled={isSavingDraft}>
          {isSavingDraft ? "Saving…" : "Save as draft"}
        </Btn>
        <Btn variant="primary" onClick={onContinue} disabled={isSubmitting}>
          {isSubmitting ? "Publishing…" : "Continue"}
          <ArrowRightIcon />
        </Btn>
      </BtnRow>
    </div>
  );
};

export default OntologyMappingStep;
