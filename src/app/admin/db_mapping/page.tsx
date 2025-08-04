"use client";

import React from "react";
import MappingForm from "./MappingForm";
import InstructionPopover from "@/element/popover/InstructionPopover";

const Page = () => {
  return (
    <div className="relative h-screen w-full">
      {/* Top-left instructions */}
      <div className="absolute top-4 left-4 z-10">
        <InstructionPopover title="Database Mapping">
          <ul className="list-disc pl-4">
            <li>
              Enter the <strong>scientific name</strong> and local (vernacular)
              name of the plant.
            </li>
            <li>
              Provide the <strong>family name</strong> and known{" "}
              <strong>habitat</strong>.
            </li>
            <li>
              Include any <strong>medicinal uses</strong> if known.
            </li>
            <li>Make sure all information is accurate and verified.</li>
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
