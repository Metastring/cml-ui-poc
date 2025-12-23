"use client";

import React, { useState } from "react";
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

const DatasetRegistration = () => {
  const [step, setStep] = useState<"initial" | "final">("initial");
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
    <div>
      {/* Stepper */}
      <div className="flex justify-center mb-6 space-x-8">
        <div
          className={`cursor-pointer pb-2 border-b-2 ${
            step === "initial"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-gray-300 text-gray-500"
          }`}
        >
          Step 1 : Initial Registration
        </div>
        <div
          onClick={() => initialDatasetMutation.isSuccess && setStep("final")}
          className={`cursor-pointer pb-2 border-b-2 ${
            step === "final"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-gray-300 text-gray-500"
          } ${
            !initialDatasetMutation.isSuccess
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          Step 2 : Final Registration
        </div>
      </div>

      {/* Forms */}
      {step === "initial" && (
        <InitialDatasetRegistraion
          onNext={handleInitialSubmit}
          isSubmitting={initialDatasetMutation.isPending}
        />
      )}
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
