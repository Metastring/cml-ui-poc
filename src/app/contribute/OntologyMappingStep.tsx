"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MappingField, OntologyFieldOption } from "@/types/app/contribute.types";
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
  controlClassName,
} from "./RegistrationUI";

interface OntologyMappingStepProps {
  location: string;
  fields: MappingField[];
  ontologyOptions: OntologyFieldOption[];
  isLoadingPreview: boolean;
  previewError: string | null;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onChangeField: (id: string, patch: Partial<MappingField>) => void;
  onAddField: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const OntologyMappingStep: React.FC<OntologyMappingStepProps> = ({
  location,
  fields,
  ontologyOptions,
  isLoadingPreview,
  previewError,
  isSubmitting,
  isSavingDraft,
  onChangeField,
  onAddField,
  onBack,
  onSaveDraft,
  onContinue,
}) => {
  const autoMapped = fields.filter((f) => f.auto && f.ontology_term).length;
  const needReview = fields.filter((f) => !f.ontology_term).length;

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

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Badge tone="success">{autoMapped} auto-mapped</Badge>
        <Badge tone="warn">{needReview} need review</Badge>
        <Badge tone="neutral">{fields.length} total fields</Badge>
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
                const mapped = Boolean(field.ontology_term);
                return (
                  <tr key={field.id} className="border-b border-[#f0f0f0] last:border-b-0 dark:border-white/5">
                    <td className="px-2.5 py-2.5 align-middle">
                      {field.added_manually ? (
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
                      <span className="font-mono text-[11.5px] text-muted-foreground">
                        {field.sample_value || "—"}
                      </span>
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
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <Btn onClick={onAddField} className="px-3 py-[7px] text-[12px]">
          + Add a field we missed
        </Btn>
        <span className="text-[11.5px] text-muted-foreground">
          Didn&apos;t find a matching term?{" "}
          <Link
            href="/ontology"
            className="font-bold text-foreground underline"
          >
            Propose a new ontology term →
          </Link>
        </span>
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
