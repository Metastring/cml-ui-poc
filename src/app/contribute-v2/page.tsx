"use client";

import React, { useState } from "react";
import InstructionPopover from "@/element/popover/InstructionPopover";
import Step1Initial from "./Step1Initial";
import Step2OntologyMapping from "./Step2OntologyMapping";

const Page = () => {
  const [step, setStep] = useState<"initial" | "final">("initial");

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="p-4">
        <InstructionPopover title="Contribute v2 – Register Your Dataset">
          <ul className="list-disc pl-4">
            <li>
              Fill all the <strong>required</strong> and{" "}
              <strong>optional</strong> details carefully.
            </li>
            <li>Ensure details are accurate before submission.</li>
          </ul>
        </InstructionPopover>
      </div>

      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-4xl">
          {/* Stepper - same as v1 */}
          <div className="flex justify-center mb-6 space-x-8">
            <button
              type="button"
              onClick={() => setStep("initial")}
              className={`cursor-pointer pb-2 border-b-2 ${
                step === "initial"
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              Step 1 : Initial Registration
            </button>
            <button
              type="button"
              onClick={() => setStep("final")}
              className={`cursor-pointer pb-2 border-b-2 ${
                step === "final"
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              Step 2 : Ontology Mapping
            </button>
          </div>

          {step === "initial" && (
            <Step1Initial onNext={() => setStep("final")} />
          )}
          {step === "final" && (
            <Step2OntologyMapping onBack={() => setStep("initial")} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
