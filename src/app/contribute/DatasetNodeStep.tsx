"use client";

import React from "react";
import { Category, DatasetNodeForm } from "@/types/app/contribute.types";
import {
  ArrowRightIcon,
  Btn,
  BtnRow,
  CardHead,
  FieldLabel,
  Grid2,
  NoStoreNote,
  NodeBanner,
  SectionLabel,
  SelectField,
  ServerIcon,
  TextAreaField,
  TextField,
} from "./RegistrationUI";

export const LICENSE_OPTIONS = [
  "CC BY 4.0",
  "CC BY-NC 4.0",
  "CC0 1.0",
  "Custom / restricted",
];

interface DatasetNodeStepProps {
  value: DatasetNodeForm;
  categories: Category[];
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onChange: (patch: Partial<DatasetNodeForm>) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const DatasetNodeStep: React.FC<DatasetNodeStepProps> = ({
  value,
  categories,
  isSubmitting,
  isSavingDraft,
  onChange,
  onCancel,
  onSaveDraft,
  onContinue,
}) => (
  <div>
    <CardHead title="Step 1 — Describe the dataset">
      This is what CML actually stores centrally: the metadata that makes your
      dataset discoverable. The data itself is registered as a link in the next
      step, not uploaded here.
    </CardHead>

    <NodeBanner
      icon={<ServerIcon />}
      title="Your dataset is registered as a separate node"
    >
      It keeps running on your own infrastructure. CML never takes ownership or a
      copy of it — the network just needs to know it exists, what it contains,
      and how to reach it.
    </NodeBanner>

    <SectionLabel>Node identity</SectionLabel>
    <Grid2>
      <div>
        <FieldLabel htmlFor="node_name">Node name</FieldLabel>
        <TextField
          id="node_name"
          placeholder="e.g. ATREE field-data node"
          value={value.node_name}
          onChange={(e) => onChange({ node_name: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel htmlFor="node_maintained_by">Node maintained by</FieldLabel>
        <TextField
          id="node_maintained_by"
          placeholder="e.g. ATREE — Ecoinformatics Lab"
          value={value.node_maintained_by}
          onChange={(e) => onChange({ node_maintained_by: e.target.value })}
        />
      </div>
    </Grid2>

    <SectionLabel>Dataset metadata</SectionLabel>
    <Grid2>
      <div>
        <FieldLabel htmlFor="title">Dataset title</FieldLabel>
        <TextField
          id="title"
          placeholder="e.g. Western Ghats amphibian survey 2025"
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel htmlFor="category">Category</FieldLabel>
        <SelectField
          id="category"
          value={value.category_id}
          onChange={(e) => onChange({ category_id: e.target.value })}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option
              key={String(category.category_id)}
              value={String(category.category_id)}
            >
              {category.category_name}
            </option>
          ))}
        </SelectField>
      </div>

      <div>
        <FieldLabel htmlFor="publisher">Publisher / organization</FieldLabel>
        <TextField
          id="publisher"
          placeholder="e.g. ATREE"
          value={value.publisher}
          onChange={(e) => onChange({ publisher: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel htmlFor="contact_email">Contact email</FieldLabel>
        <TextField
          id="contact_email"
          type="email"
          placeholder="name@organization.org"
          value={value.contact_email}
          onChange={(e) => onChange({ contact_email: e.target.value })}
        />
      </div>

      <div>
        <FieldLabel htmlFor="license">License</FieldLabel>
        <SelectField
          id="license"
          value={value.license}
          onChange={(e) => onChange({ license: e.target.value })}
        >
          {LICENSE_OPTIONS.map((license) => (
            <option key={license} value={license}>
              {license}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <FieldLabel htmlFor="keywords" hint="(comma separated)">
          Keywords
        </FieldLabel>
        <TextField
          id="keywords"
          placeholder="amphibians, occurrence, Western Ghats"
          value={value.keywords}
          onChange={(e) => onChange({ keywords: e.target.value })}
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="description">Short description</FieldLabel>
        <TextAreaField
          id="description"
          rows={3}
          placeholder="What does this dataset contain, how was it collected, and how can it be used?"
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
    </Grid2>

    <NoStoreNote>
      <b className="font-bold">Nothing about your records is collected here</b> —
      species names, coordinates, samples, etc. This step only captures how the
      dataset should describe itself in the catalog. You&apos;ll point us to the
      actual data next.
    </NoStoreNote>

    <BtnRow
      left={
        <Btn variant="ghost" onClick={onCancel}>
          Cancel
        </Btn>
      }
    >
      <Btn onClick={onSaveDraft} disabled={isSavingDraft}>
        {isSavingDraft ? "Saving…" : "Save as draft"}
      </Btn>
      <Btn variant="primary" onClick={onContinue} disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Continue"}
        <ArrowRightIcon />
      </Btn>
    </BtnRow>
  </div>
);

export default DatasetNodeStep;
