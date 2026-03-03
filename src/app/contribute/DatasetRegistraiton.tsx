"use client";

import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import InitialDatasetRegistraion from "./InitialDatasetRegistration";
import FinalDatasetRegistration from "./FinalDatasetRegistration";
import { useRegisterYourDataset } from "@/api/contributeApiHandler/ContributeApiHandler";
import { toast } from "sonner";
import {
  FinalDatasetForm,
  // InitialDatasetForm,
  InitialDatasetResponse,
  InitialDatasetSubmitPayload,
} from "@/types/app/contribute.types";

const ACCEPT_FILES = ".json,.xlsx,.xls";

interface UploadModeState {
  file: File | null;
  error: string | null;
  isDragging: boolean;
}

const InitialUploadPane: React.FC = () => {
  const [state, setState] = useState<UploadModeState>({
    file: null,
    error: null,
    isDragging: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metadata, setMetadata] = useState({
    description: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setState({ file: null, error: null, isDragging: false });
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          JSON.parse(text);
          setState({ file, error: null, isDragging: false });
        } catch {
          setState({
            file: null,
            error: "The JSON file could not be parsed. Please check its structure.",
            isDragging: false,
          });
        }
      };
      reader.readAsText(file);
    } else {
      setState({ file, error: null, isDragging: false });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) {
      setState((prev) => ({ ...prev, isDragging: false }));
      return;
    }
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = () => {
    setState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleNext = () => {
    toast.info(
      "File-based metadata upload is being wired to the backend. We’ve captured your metadata details."
    );
  };

  const { file, error, isDragging } = state;

  return (
    <div className="w-full rounded-lg border border-border/60 bg-card p-6 shadow-sm">
      <div className="mb-4 space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Step 1 — Upload metadata file
        </h2>
        <p className="text-xs text-muted-foreground">
          Upload a JSON or spreadsheet file that contains your dataset metadata. We&apos;ll soon
          use this to pre-fill the registration details for you.
        </p>
      </div>

      <Label className="pb-2 block text-sm font-medium">Upload metadata (JSON or Excel)</Label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/60 hover:bg-muted/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_FILES}
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
        <p className="text-sm text-foreground">
          Drag and drop a file here, or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepted formats: .json, .xlsx, .xls
        </p>
        {file && (
          <p className="mt-3 text-sm font-medium text-foreground">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      {/* Basic metadata input collected alongside the upload */}
      <div className="mt-6 space-y-3">
        <div>
          <Label className="pb-1 block text-sm font-medium">
            Dataset description (optional)
          </Label>
          <textarea
            rows={3}
            placeholder="Briefly describe what this dataset contains and how it can be used."
            value={metadata.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMetadata((prev) => ({ ...prev, description: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleNext}
          disabled={!file}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:w-1/3"
        >
          Continue
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Ontology mapping and full registration flow will work the same way as with the form-based
          option once file upload is fully enabled.
        </p>
      </div>
    </div>
  );
};

const DatasetRegistration = () => {
  const [step, setStep] = useState<"initial" | "final">("initial");
  const [initialMode, setInitialMode] = useState<"form" | "upload">("upload");
  const [datasetId, setDatasetId] = useState<string>("");

  const { initialDatasetMutation, finalDatasetMutation } =
    useRegisterYourDataset();

  const handleInitialSubmit = (data: InitialDatasetSubmitPayload) => {
    initialDatasetMutation.mutate(
      { endpoint: "/dataset-registry", params: data },
      {
        onSuccess: (res: InitialDatasetResponse) => {
          // toast.success("Initial dataset !");
          setDatasetId(res.dataset_id);
          setStep("final");
        },
        onError: (err: { message: string }) => {
          toast.error(
            `Error: ${err.message || "Failed to submit initial dataset"}`
          );
        },
      }
    );
  };

  const handleFinalSubmit = (data: FinalDatasetForm) => {
    if (!datasetId) {
      toast.error(
        "Dataset ID missing! Please complete initial registration first."
      );
      setStep("initial");
      return;
    }
    finalDatasetMutation.mutate(
  {
    endpoint: "/dataset-mapping-update",
    params: data,
  },
  {
    onSuccess: () => {
      toast.success("Dataset mapping updated successfully!");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message || "Failed to update dataset mapping");
    },
  }
);

  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="space-y-2">
      

        {/* Stepper */}
        <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-start sm:gap-4">
          <div
            className={`flex items-center gap-3 rounded-md px-2 py-1 ${
              step === "initial" ? "bg-primary/5" : ""
            }`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <button
              type="button"
              className={`border-b-2 pb-1 text-left text-sm transition-colors ${
                step === "initial"
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground"
              }`}
              onClick={() => setStep("initial")}
            >
              {`Step 1 · Metadata registration — ${
                initialMode === "upload" ? "upload file" : "fill form"
              }`}
            </button>
          </div>

          <div
            className={`flex items-center gap-3 rounded-md px-2 py-1 ${
              step === "final" ? "bg-primary/5" : ""
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                initialDatasetMutation.isSuccess
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </span>
            <button
              type="button"
              onClick={() =>
                initialDatasetMutation.isSuccess && setStep("final")
              }
              className={`border-b-2 pb-1 text-left text-sm transition-colors ${
                step === "final"
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground"
              } ${
                !initialDatasetMutation.isSuccess
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              Step 2 · Ontology mapping
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className={`h-full rounded-full bg-primary transition-all ${
              step === "initial" ? "w-1/2" : "w-full"
            }`}
          />
        </div>

        {step === "initial" && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setInitialMode("upload")}
              className={`rounded-full px-3 py-1 transition-colors ${
                initialMode === "upload"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload file
            </button>
            <span className="px-1 text-[14px] text-black font-bold ">or</span>
            <button
              type="button"
              onClick={() => setInitialMode("form")}
              className={`rounded-full px-3 py-1 transition-colors ${
                initialMode === "form"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fill form
            </button>
          </div>
        )}
      </div>

      {/* Forms */}
      {step === "initial" && initialMode === "form" && (
        <InitialDatasetRegistraion
          onNext={handleInitialSubmit}
          isSubmitting={initialDatasetMutation.isPending}
        />
      )}

      {step === "initial" && initialMode === "upload" && <InitialUploadPane />}
      {step === "final" && (
        <FinalDatasetRegistration
          datasetId={datasetId}
          onSubmit={handleFinalSubmit}
          onBackToInitial={() => setStep("initial")}
          isSubmitting={finalDatasetMutation.isPending}
        />
      )}
    </div>
  );
};

export default DatasetRegistration;
