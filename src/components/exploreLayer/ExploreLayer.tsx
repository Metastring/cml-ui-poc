import React from "react";
import Indicators from "@/components/exploreLayer/Indicators";
import InstructionPopover from "@/element/popover/InstructionPopover";
import SelectedIndicators from "./ActiveIndicators";

const ExploreLayer = () => {
  return (
    <div className="w-[500px] h-screen flex flex-col p-4 space-y-2">
      <div className="flex justify-between items-center shrink-0">
        <InstructionPopover title="HHM Indicators">
          <p>
            Indicators represent spatial layers based on different health and
            habitat parameters. These layers help visualize and assess
            environmental conditions, public health risks, and resource
            availability within selected geographic areas.
          </p>
        </InstructionPopover>
        <SelectedIndicators />
      </div>

      <div className="flex-1 overflow-y-auto">
        <Indicators />
      </div>
    </div>
  );
};

export default ExploreLayer;
