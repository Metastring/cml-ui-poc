"use client";

import React, { useState } from "react";
import FederatedSearchBar from "@/app/federated_search/FederatedSearchBar";
import InstructionPopover from "@/element/popover/InstructionPopover";
import { LocateFixed, LocateOff } from "lucide-react";
import BaseMap from "@/components/map/BaseMap";
import AddMarker from "@/components/mapFeatures/addMarker/AddMarker";
import NewFederatedDataTable from "./NewFederatedDataTable";
import useFederatedMapData from "@/store/useFederatedMapData";

const Page = () => {
  const [isMapVisible, setIsMapVIsible] = useState(false);
  const { selectedCoordinates } = useFederatedMapData();
  console.log("selectedCoordinates", selectedCoordinates);
  return (
    <div className="h-screen flex flex-col p-4 space-y-2">
      {/* Top bar */}
      <div className="flex items-center space-x-2">
        <InstructionPopover title="Federated Search">
          <p>
            Federated Search queries multiple remote databases and returns
            unified results in a single view.
          </p>
        </InstructionPopover>
        {isMapVisible ? (
          <button type="button" title="Hide Map">
            <LocateOff onClick={() => setIsMapVIsible((prev) => !prev)} />
          </button>
        ) : (
          <button title="View Map">
            <LocateFixed onClick={() => setIsMapVIsible((prev) => !prev)} />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden space-x-4">
        {/* Left Content */}
        <div className="flex flex-col flex-1 min-w-0 space-y-4 overflow-hidden">
          <FederatedSearchBar />
          <NewFederatedDataTable />
          {/* <FederatedResult /> */}
        </div>

        {/* Right Map Section */}
        <div
          className={`
            transition-all duration-500
            shadow-lg overflow-hidden
            ${isMapVisible ? "w-[50vw]" : "w-0"}
          `}
        >
          <div className="h-full w-full">
            <BaseMap />
            {selectedCoordinates?.lat && selectedCoordinates?.lat && (
              <AddMarker
                coordinates={[selectedCoordinates.lng, selectedCoordinates.lat]}
                popupText={selectedCoordinates.label}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
