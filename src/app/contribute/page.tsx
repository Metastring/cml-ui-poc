"use client";

import React from "react";
import InstructionPopover from "@/element/popover/InstructionPopover";
import DatasetRegistration from "./DatasetRegistraiton";

const Page = () => {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top-left instructions */}
      <div className="p-4">
        <InstructionPopover title="Register Your Dataset">
          <ul className="list-disc pl-4">
            <li>
              Fill all the <strong>required</strong> and{" "}
              <strong>optional</strong> details carefully.
            </li>
            <li>Ensure details are accurate before submission.</li>
          </ul>
        </InstructionPopover>
      </div>

      {/* Center form */}
      <div className="flex flex-1  justify-center">
        <DatasetRegistration/>
      </div>
    </div>
  );
};

export default Page;
