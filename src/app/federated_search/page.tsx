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
  const [isMapVisible, setIsMapVisible] = useState(false);
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
  }, [resultKeys, activeKey]);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
  <div className="w-96 border-r p-4 flex flex-col space-y-4">
        {/* Top bar merged here */}
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <InstructionPopover title="Federated Search">
            <p>
              Federated Search queries multiple remote databases and returns
              unified results in a single view.
            </p>
          </InstructionPopover>

          {isMapVisible ? (
            <button
              type="button"
              title="Hide Map"
              onClick={() => setIsMapVisible(false)}
            >
              <LocateOff />
            </button>
          ) : (
            <button
              type="button"
              title="Show Map"
              onClick={() => setIsMapVisible(true)}
            >
              <LocateFixed />
            </button>
          )}
        </div>

        <FederatedSearchBar mutate={mutate} />
      </div>

      {/* Right Section (Map + Tabs + Table) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map Section - inside right side only */}
        <div
          className={`transition-all duration-500 overflow-hidden shadow-lg ${
            isMapVisible ? "h-[50vh]" : "h-0"
          }`}
        >
          {isMapVisible && (
            <div className="h-full w-full">
              <BaseMap />
              <AddMarker markers={visibleMarkers} flyTo={selectedCoordinates} />
            </div>
          )}
        </div>

        {/* Tabs Above Table */}
        <div className="border-b  flex space-x-2 bg-gray-50">
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

        {/* Table Section */}
        <div className="flex-1 overflow-auto">
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
      </div>
    </div>
  );
};

export default Page;
