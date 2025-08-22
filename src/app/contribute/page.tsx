"use client";

import React from "react";
import MappingForm from "./MappingForm";
import InstructionPopover from "@/element/popover/InstructionPopover";

const Page = () => {
  return (
    <div className="relative h-screen w-full">
      {/* Top-left instructions */}
      <div className="absolute top-4 left-4 z-10">
        <InstructionPopover title="Onboard Your Dataset">
          <ul className="list-disc pl-4">
            <li>
              Fill all the <strong>required</strong> and{" "}
              <strong>optional</strong> details carefully.
            </li>
            <li>Ensure details are accurate before submission.</li>
          </ul>
        </InstructionPopover>
      </div>

      <div className="flex items-center justify-center h-full">
        <MappingForm />
      </div>
    </div>
  );
};

export default Page;
