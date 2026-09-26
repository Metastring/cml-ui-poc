"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ONTOLOGY_GRAPH_KEY,
  useCreateDraft,
  useGetCategories,
  useGetOntologyFields,
  usePublishDataset,
  useSaveDatabaseReference,
  useSaveFileReference,
  useSaveMapServiceReference,
  useSaveMappings,
  useSaveUrlReference,
  useSuggestMappings,
  useUpdateDraft,
  useVerifyDatabaseReference,
  useVerifyFileReference,
  useVerifyMapServiceReference,
} from "@/api/contributeApiHandler/ContributeApiHandler";
import {
  Category,
  CreateDraftPayload,
  DataReferenceForm,
  DatasetNodeForm,
  MappingField,
  PublishSummary,
  ReachabilityResult,
  RegistrationStep,
} from "@/types/app/contribute.types";
import DataReferenceStep, {
  ENGINE_OPTIONS,
  FILE_FORMAT_OPTIONS,
  LAYER_TYPE_OPTIONS,
  RESPONSE_FORMAT_OPTIONS,
} from "./DataReferenceStep";
import DatasetNodeStep, { LICENSE_OPTIONS } from "./DatasetNodeStep";
import OntologyMappingStep from "./OntologyMappingStep";
import ReviewPublishStep from "./ReviewPublishStep";
import { CheckIcon } from "./RegistrationUI";

const STEPS: { step: RegistrationStep; label: string }[] = [
  { step: 1, label: "Dataset & node" },
  { step: 2, label: "Data reference" },
  { step: 3, label: "Ontology mapping" },
  { step: 4, label: "Review & publish" },
];

const EMPTY_NODE_FORM: DatasetNodeForm = {
  node_name: "",
  node_maintained_by: "",
  title: "",
  category_id: "",
  publisher: "",
  contact_email: "",
  license: LICENSE_OPTIONS[0],
  keywords: "",
  description: "",
};

const EMPTY_REFERENCE_FORM: DataReferenceForm = {
  reference_type: "file",
  reference_uri: "",
  file_format: FILE_FORMAT_OPTIONS[0],
  access_credentials_ref: "",
  source_url: "",
  method: "GET",
  response_format: RESPONSE_FORMAT_OPTIONS[0],
  auth_header: "",
  connection_string: "",
  table_name: "",
  engine: ENGINE_OPTIONS[0],
  map_service_url: "",
  layer_type: LAYER_TYPE_OPTIONS[0],
  layer_name: "",
};

/* ---------- reference helpers ---------- */

const referenceLocation = (reference: DataReferenceForm) => {
  switch (reference.reference_type) {
    case "url":
      return reference.source_url;
    case "database":
      return `${reference.connection_string}${
        reference.table_name ? ` · ${reference.table_name}` : ""
      }`;
    case "map-service":
      return reference.map_service_url;
    default:
      return reference.reference_uri;
  }
};

const referenceTypeLabel = (reference: DataReferenceForm) => {
  switch (reference.reference_type) {
    case "url":
      return "URL / API";
    case "database":
      return `Database (${reference.engine})`;
    case "map-service":
      return `Map service (${reference.layer_type})`;
    default: {
      const scheme = reference.reference_uri.split("://")[0];
      return scheme && scheme !== reference.reference_uri
        ? `File path (${scheme}://)`
        : "File path";
    }
  }
};

const missingReferenceField = (reference: DataReferenceForm) => {
  switch (reference.reference_type) {
    case "url":
      return reference.source_url.trim() ? null : "Add the source URL";
    case "database":
      if (!reference.connection_string.trim()) return "Add the connection string";
      return reference.table_name.trim() ? null : "Add the table / view name";
    case "map-service":
      if (!reference.map_service_url.trim()) return "Add the map service URL";
      return reference.layer_name.trim() ? null : "Add the layer name";
    default:
      return reference.reference_uri.trim() ? null : "Add the file path or URI";
  }
};

/* ---------- stepper ---------- */

const Stepper = ({
  current,
  onSelect,
}: {
  current: RegistrationStep;
  onSelect: (step: RegistrationStep) => void;
}) => (
  <div className="mb-3.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2.5">
    {STEPS.map(({ step, label }, index) => {
      const isDone = step < current;
      const isActive = step === current;
      return (
        <React.Fragment key={step}>
          <button
            type="button"
            onClick={() => isDone && onSelect(step)}
            disabled={!isDone}
            className={cn(
              "flex items-center gap-[9px] rounded-lg px-2.5 py-[5px] text-[13px]",
              isActive && "bg-[rgba(23,23,23,0.05)] dark:bg-white/10",
              isDone ? "cursor-pointer" : "cursor-default"
            )}
          >
            <span
              className={cn(
                "flex size-[22px] flex-none items-center justify-center rounded-full text-[11px] font-bold",
                isActive || isDone
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isDone ? <CheckIcon /> : step}
            </span>
            <span
              className={cn(
                isActive
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
          {index < STEPS.length - 1 && (
            <span className="mx-0.5 hidden h-px w-[34px] bg-border sm:block" />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ================= WIZARD ================= */

const RegistrationWizard = () => {
  const router = useRouter();
  const manualFieldCount = useRef(0);

  const [step, setStep] = useState<RegistrationStep>(1);
  const [datasetId, setDatasetId] = useState("");
  const [nodeForm, setNodeForm] = useState<DatasetNodeForm>(EMPTY_NODE_FORM);
  const [reference, setReference] =
    useState<DataReferenceForm>(EMPTY_REFERENCE_FORM);
  const [verifyState, setVerifyState] = useState<"idle" | "checking" | "done">(
    "idle"
  );
  const [verifyResult, setVerifyResult] = useState<ReachabilityResult | null>(
    null
  );
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [fields, setFields] = useState<MappingField[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PublishSummary | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const { data: categoriesData } = useGetCategories();
  const { data: ontologyOptions } = useGetOntologyFields(
    DEFAULT_ONTOLOGY_GRAPH_KEY
  );

  const createDraft = useCreateDraft();
  const updateDraft = useUpdateDraft();
  const saveFileReference = useSaveFileReference();
  const saveUrlReference = useSaveUrlReference();
  const saveDatabaseReference = useSaveDatabaseReference();
  const saveMapServiceReference = useSaveMapServiceReference();
  const verifyFileReference = useVerifyFileReference();
  const verifyDatabaseReference = useVerifyDatabaseReference();
  const verifyMapServiceReference = useVerifyMapServiceReference();
  const suggestMappings = useSuggestMappings();
  const saveMappings = useSaveMappings();
  const publishDataset = usePublishDataset();

  const isSavingReference =
    saveFileReference.isPending ||
    saveUrlReference.isPending ||
    saveDatabaseReference.isPending ||
    saveMapServiceReference.isPending;

  /** Saves the reference through the endpoint that matches the selected type. */
  const saveReference = (id: string) => {
    switch (reference.reference_type) {
      case "url":
        return saveUrlReference.mutateAsync({
          datasetId: id,
          params: {
            source_url: reference.source_url,
            method: reference.method,
            auth_header: reference.auth_header || null,
            response_format: reference.response_format,
          },
        });
      case "database":
        return saveDatabaseReference.mutateAsync({
          datasetId: id,
          params: {
            connection_string: reference.connection_string,
            table_name: reference.table_name,
            engine: reference.engine,
          },
        });
      case "map-service":
        return saveMapServiceReference.mutateAsync({
          datasetId: id,
          params: {
            map_service_url: reference.map_service_url,
            layer_type: reference.layer_type,
            layer_name: reference.layer_name,
          },
        });
      default:
        return saveFileReference.mutateAsync({
          datasetId: id,
          params: {
            reference_uri: reference.reference_uri,
            file_format: reference.file_format,
            access_credentials_ref: reference.access_credentials_ref || null,
          },
        });
    }
  };

  /** Verifies the saved reference. URL references have no verify endpoint yet. */
  const runVerify = (id: string) => {
    switch (reference.reference_type) {
      case "url":
        return null;
      case "database":
        return verifyDatabaseReference.mutateAsync({ datasetId: id });
      case "map-service":
        return verifyMapServiceReference.mutateAsync({ datasetId: id });
      default:
        return verifyFileReference.mutateAsync({ datasetId: id });
    }
  };

  const categories: Category[] = useMemo(() => {
    if (Array.isArray(categoriesData)) return categoriesData as Category[];
    return (categoriesData?.categories as Category[]) ?? [];
  }, [categoriesData]);

  const selectedCategory = categories.find(
    (category) => String(category.category_id) === nodeForm.category_id
  );

  /* ---------- step 1 ---------- */

  const draftPayload = (isDraft: boolean): CreateDraftPayload => ({
    category: selectedCategory
      ? {
          category_id: String(selectedCategory.category_id),
          category_name: selectedCategory.category_name,
        }
      : null,
    title: nodeForm.title,
    description: nodeForm.description,
    license: nodeForm.license,
    keywords: nodeForm.keywords,
    dataset_type: reference.reference_type,
    is_active: !isDraft,
    node_name: nodeForm.node_name,
    node_maintained_by: nodeForm.node_maintained_by,
    publishers: nodeForm.publisher
      ? [{ publisher_name: nodeForm.publisher, record_count: 0 }]
      : [],
    contacts: nodeForm.contact_email
      ? [
          {
            name: nodeForm.node_maintained_by || nodeForm.publisher,
            role: "Node maintainer",
            email: nodeForm.contact_email,
            organization: nodeForm.publisher,
          },
        ]
      : [],
    sources: [],
    statistics: [],
  });

  const persistDraft = async (isDraft: boolean) => {
    if (datasetId) {
      await updateDraft.mutateAsync({
        datasetId,
        params: {
          title: nodeForm.title,
          description: nodeForm.description,
          license: nodeForm.license,
          keywords: nodeForm.keywords,
          dataset_type: reference.reference_type,
          category_id: nodeForm.category_id,
          node_name: nodeForm.node_name,
          node_maintained_by: nodeForm.node_maintained_by,
        },
      });
      return datasetId;
    }

    const res = await createDraft.mutateAsync(draftPayload(isDraft));
    if (!res.dataset_id) {
      throw new Error("The server didn't return a dataset id for this draft");
    }
    setDatasetId(res.dataset_id);
    return res.dataset_id;
  };

  const handleSaveDraft = async () => {
    if (!nodeForm.title.trim()) {
      toast.error("Dataset title is required before saving a draft");
      return;
    }
    setIsSavingDraft(true);
    try {
      await persistDraft(true);
      toast.success("Draft saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft"
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleNodeContinue = async () => {
    if (!nodeForm.node_name.trim()) return toast.error("Node name is required");
    if (!nodeForm.title.trim()) return toast.error("Dataset title is required");
    if (!nodeForm.category_id) return toast.error("Pick a category");

    try {
      await persistDraft(false);
      setStep(2);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to register the dataset"
      );
    }
  };

  /* ---------- step 2 ---------- */

  const handleVerify = async () => {
    const missing = missingReferenceField(reference);
    if (missing) return toast.error(missing);
    if (!datasetId) return toast.error("Complete step 1 first");

    setVerifyState("checking");
    setVerifyResult(null);
    setVerifyError(null);

    try {
      await saveReference(datasetId);

      const verification = runVerify(datasetId);
      if (!verification) {
        // The API exposes no /reference/url/verify yet.
        setVerifyState("done");
        setVerifyError(
          "Reference saved — live verification isn't available for URL references yet"
        );
        return;
      }

      setVerifyResult(await verification);
      setVerifyState("done");
    } catch (error) {
      setVerifyState("done");
      setVerifyError(
        error instanceof Error ? error.message : "Could not verify this reference"
      );
    }
  };

  const loadSuggestions = async (id: string) => {
    setPreviewError(null);
    try {
      const suggestions = await suggestMappings.mutateAsync({
        datasetId: id,
        graphKey: DEFAULT_ONTOLOGY_GRAPH_KEY,
      });
      setFields(
        suggestions.map((suggestion, index) => ({
          id: `detected-${index}-${suggestion.field_name}`,
          field_name: suggestion.field_name,
          sample_value: suggestion.sample_value,
          ontology_term: suggestion.suggested_term ?? "",
          auto: Boolean(suggestion.suggested_term),
          added_manually: false,
        }))
      );
    } catch (error) {
      setPreviewError(
        error instanceof Error
          ? error.message
          : "We couldn't fetch a schema preview from the source."
      );
    }
  };

  const handleReferenceContinue = async () => {
    const missing = missingReferenceField(reference);
    if (missing) return toast.error(missing);
    if (!datasetId) return toast.error("Complete step 1 first");

    try {
      await saveReference(datasetId);
      setStep(3);
      if (fields.length === 0) void loadSuggestions(datasetId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save the reference"
      );
    }
  };

  /* ---------- step 3 ---------- */

  const handleChangeField = (id: string, patch: Partial<MappingField>) =>
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );

  const handleAddField = () => {
    manualFieldCount.current += 1;
    setFields((prev) => [
      ...prev,
      {
        id: `manual-${manualFieldCount.current}`,
        field_name: "",
        sample_value: "",
        ontology_term: "",
        auto: false,
        added_manually: true,
      },
    ]);
  };

  const handlePublish = async () => {
    const mapped = fields.filter(
      (field) => field.field_name.trim() && field.ontology_term
    );
    if (mapped.length === 0) {
      toast.error("Map at least one field to an ontology term");
      return;
    }

    try {
      await saveMappings.mutateAsync({
        datasetId,
        params: {
          ontology_graph_key: DEFAULT_ONTOLOGY_GRAPH_KEY,
          mappings: mapped.map((field) => ({
            field_name: field.field_name.trim(),
            ontology_field: field.ontology_term,
          })),
        },
      });

      const res = await publishDataset.mutateAsync({ datasetId });

      setSummary({
        title: nodeForm.title,
        node_name: nodeForm.node_name,
        reference_type: referenceTypeLabel(reference),
        data_location: referenceLocation(reference),
        category: selectedCategory?.category_name ?? "",
        fields_mapped: mapped.length,
        fields_total: fields.length,
        manually_added: fields.filter((field) => field.added_manually).length,
        status: res.status ?? "Pending reachability check",
      });
      setStep(4);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish the node"
      );
    }
  };

  const handleRegisterAnother = () => {
    setStep(1);
    setDatasetId("");
    setNodeForm(EMPTY_NODE_FORM);
    setReference(EMPTY_REFERENCE_FORM);
    setVerifyState("idle");
    setVerifyResult(null);
    setVerifyError(null);
    setFields([]);
    setPreviewError(null);
    setSummary(null);
  };

  /* ---------- render ---------- */

  return (
    <main className="mx-auto w-full max-w-[1280px] px-8 pb-[60px] pt-7">
      <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.01em] text-foreground">
        Register your dataset
      </h1>
      <p className="mb-[22px] max-w-[760px] text-[14px] leading-[1.55] text-muted-foreground">
        Your data stays where it already lives — on your own server, database, or
        file store. CML registers it as an independent node in the network: we
        catalog rich metadata and keep a reference to your data, not a copy of
        it.
      </p>

      <Stepper current={step} onSelect={setStep} />

      <div className="mb-[22px] h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${step * 25}%` }}
        />
      </div>

      <section className="rounded-xl border border-border bg-card px-7 py-[26px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {step === 1 && (
          <DatasetNodeStep
            value={nodeForm}
            categories={categories}
            isSubmitting={createDraft.isPending || updateDraft.isPending}
            isSavingDraft={isSavingDraft}
            onChange={(patch) => setNodeForm((prev) => ({ ...prev, ...patch }))}
            onCancel={() => router.push("/")}
            onSaveDraft={handleSaveDraft}
            onContinue={handleNodeContinue}
          />
        )}

        {step === 2 && (
          <DataReferenceStep
            value={reference}
            verifyState={verifyState}
            verifyResult={verifyResult}
            verifyError={verifyError}
            isSavingDraft={isSavingDraft}
            isSaving={isSavingReference}
            onChange={(patch) => {
              setReference((prev) => ({ ...prev, ...patch }));
              setVerifyState("idle");
              setVerifyResult(null);
              setVerifyError(null);
            }}
            onVerify={handleVerify}
            onBack={() => setStep(1)}
            onSaveDraft={handleSaveDraft}
            onContinue={handleReferenceContinue}
          />
        )}

        {step === 3 && (
          <OntologyMappingStep
            location={referenceLocation(reference)}
            fields={fields}
            ontologyOptions={ontologyOptions}
            isLoadingPreview={suggestMappings.isPending}
            previewError={previewError}
            isSubmitting={saveMappings.isPending || publishDataset.isPending}
            isSavingDraft={isSavingDraft}
            onChangeField={handleChangeField}
            onAddField={handleAddField}
            onBack={() => setStep(2)}
            onSaveDraft={handleSaveDraft}
            onContinue={handlePublish}
          />
        )}

        {step === 4 && summary && (
          <ReviewPublishStep
            summary={summary}
            onRegisterAnother={handleRegisterAnother}
          />
        )}
      </section>
    </main>
  );
};

export default RegistrationWizard;
