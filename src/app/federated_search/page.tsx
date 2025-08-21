"use client";

import React, { useEffect, useState } from "react";
import FederatedSearchBar from "@/app/federated_search/FederatedSearchBar";
import InstructionPopover from "@/element/popover/InstructionPopover";
import { LocateFixed, LocateOff } from "lucide-react";
import BaseMap from "@/components/map/BaseMap";
import AddMarker from "@/components/mapFeatures/addMarker/AddMarker";
import { useMutateFederatedSearch } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import FederatedDataTable from "./FederatedDataTable";
import useFederatedSearchMapData from "@/store/federated_search_store/useFederatedSearchMapData";

const Page = () => {
  const [isMapVisible, setIsMapVIsible] = useState(false);
  const { selectedCoordinates, visibleMarkers } = useFederatedSearchMapData();
  const {
    data,
    isError,
    mutate,
    isMutating: isLoading,
  } = useMutateFederatedSearch();
  const resultKeys = Object.keys(data?.results || {});
  const [activeKey, setActiveKey] = useState<string | null>(resultKeys[0]);

  useEffect(() => {
    if (resultKeys.length > 0) {
      if (!activeKey || !resultKeys.includes(activeKey)) {
        setActiveKey(resultKeys[0]);
      }
    } else {
      setActiveKey(null);
    }
  }, [resultKeys ,activeKey]);

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
        <div className="flex flex-col flex-1 min-w-0 space-y-2 overflow-hidden">
          <FederatedSearchBar mutate={mutate} />

          {/* Tabs */}
          <div className="flex space-x-2 border-b">
            {resultKeys.map((key) => (
              <button
                key={key}
                className={`px-4 py-2 cursor-pointer ${
                  activeKey === key
                    ? "border-b-2 border-blue-600 font-bold text-blue-700"
                    : ""
                }`}
                onClick={() => setActiveKey(key)}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active Table */}
          <FederatedDataTable
            isLoading={isLoading}
            isError={isError}
            data={Object.values(
              data?.results?.[activeKey ?? 0]?.field_results ?? {}
            ).flatMap(
              (field: { results?: Record<string, unknown>[] | undefined }) =>
                field.results ?? []
            )}
          />
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
            <AddMarker markers={visibleMarkers} flyTo={selectedCoordinates} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
