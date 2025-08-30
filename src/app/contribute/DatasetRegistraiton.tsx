"use client";

import React, { useState } from "react";
import InitialDatasetRegistraion, { InitialDatasetForm } from "./InitialDatasetRegistration";
import FinalDatasetRegistration, { FinalDatasetForm } from "./FinalDatasetRegistration";
import { useRegisterYourDataset } from "@/api/contributeApiHandler/ContributeApiHandler";
import { toast } from "sonner";

// Type for API response of initial submission
interface InitialDatasetResponse {
  dataset_id: string;
}

const DatasetRegistration = () => {
  const [step, setStep] = useState<"initial" | "final">("initial");
  const [datasetId, setDatasetId] = useState<string>("");

  const { initialDatasetMutation, finalDatasetMutation } = useRegisterYourDataset();

  const handleInitialSubmit = (data: InitialDatasetForm) => {
    initialDatasetMutation.mutate(
      { endpoint: "/dataset-master", params: data },
      {
        onSuccess: (res: InitialDatasetResponse) => {
          // toast.success("Initial dataset !");
          setDatasetId(res.dataset_id);
          setStep("final");
        },
        onError: (err: { message: string }) => {
          toast.error(`Error: ${err.message || "Failed to submit initial dataset"}`);
        },
      }
    );
  };

  const handleFinalSubmit = (data: Omit<FinalDatasetForm, "dataset_id">) => {
    if (!datasetId) {
      toast.error("Dataset ID missing! Please complete initial registration first.");
      setStep("initial");
      return;
    }

    finalDatasetMutation.mutate(
      { endpoint: "/dataset-details", params: { ...data, dataset_id: String(datasetId) } },
      {
        onSuccess: () => {
          toast.success("Final dataset submitted successfully!");
        },
        onError: (err: { message: string }) => {
          toast.error(`Error: ${err.message || "Failed to submit final dataset"}`);
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
          } ${!initialDatasetMutation.isSuccess ? "opacity-50 cursor-not-allowed" : ""}`}
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
          isSubmitting={finalDatasetMutation.isPending}
        />
      )}
    </div>
  );
};

export default DatasetRegistration;
