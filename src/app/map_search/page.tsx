"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelRightOpen,
} from "lucide-react";
import InstructionPopover from "@/element/popover/InstructionPopover";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";
import {
  useGetMapSearchData,
  useGetWMSLayerByDataset,
} from "@/api/mapSearchApiHandler/MapSearchApiHandler";
import useMapSearchFilter from "@/store/map_search_store/useMapSearchFilter";
import AddLayer from "@/components/mapFeatures/addLayer/AddLayer";
import BaseMap from "@/components/map/BaseMap";
import PolygonEditor from "@/components/mapFeatures/polygonEditor/PolygonEditor";
import AddMarker from "@/components/mapFeatures/addMarker/AddMarker";
import MapSearchBar from "@/app/map_search/MapSearchBar";
import MapSearchDataTable from "@/app/map_search/MapSearchDataTable";

const Page = () => {
  const [tableVisible, setTableVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { selectedCoordinates, visibleMarkers } = useMapSearchData();
  const { datasets } = useMapSearchFilter();
  const { data: WMS_SOURCE } = useGetWMSLayerByDataset({
    dataset: datasets.map((k) =>
      k === "Global Biodiversity Info Facility"
        ? "gbif"
        : k === "Kew Plant Database"
        ? "kew"
        : k ==="Citizens' Portal of Medicinal Plants" ? "cpmp" : k
    ),
  });

  const {
    mutate,
    isLoading: isMapDataLoading,
    clearDataMapSearchData,
    isError
  } = useGetMapSearchData();

  return (
    <div className="w-full h-screen flex flex-col p-4 space-y-4 overflow-hidden">
      {/* Top Section: Map + Sidebar */}
      <div
        className={`flex flex-col md:flex-row w-full ${
          tableVisible ? "flex-[0.5]" : "flex-1"
        } gap-4 transition-all duration-300 overflow-hidden`}
      >
        {/* Sidebar with instructions and search */}
        {sidebarVisible ? (
          <div className="flex flex-col gap-4 w-auto shrink-0">
            <div className="flex items-center justify-between">
              <InstructionPopover title="Explore Instructions">
                <p className="font-medium">How to Draw on the Map:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Select a shape: polygon, circle, rectangle, etc.</li>
                  <li>Click to start drawing on the map.</li>
                  <li>Draw the shape wherever you want.</li>
                  <li>Use delete/trash buttons to delete shapes.</li>
                  <li>Click download to save GeoJSON.</li>
                </ul>
              </InstructionPopover>
              <div className="flex">
                <button
                  onClick={() => setSidebarVisible((prev) => !prev)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full"
                >
                  {sidebarVisible ? (
                    <PanelRightOpen size={20} />
                  ) : (
                    <PanelRightOpen size={20} />
                  )}
                </button>

                <button
                  onClick={() => setTableVisible((prev) => !prev)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full"
                >
                  {tableVisible ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronUp size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <MapSearchBar
              onSearch={() => setTableVisible(true)}
              mutate={mutate}
              clearDataMapSearchData={clearDataMapSearchData}
              isMapDataLoading={isMapDataLoading}
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <button
              onClick={() => setSidebarVisible((prev) => !prev)}
              className="ml-2 p-1 hover:bg-gray-200 rounded-full"
            >
              {sidebarVisible ? (
                <ChevronDown size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>
            <button
              onClick={() => setTableVisible((prev) => !prev)}
              className="ml-2 p-1 hover:bg-gray-200 rounded-full"
            >
              {tableVisible ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </button>
            <div></div>
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 h-full relative rounded-lg overflow-hidden shadow-md">
          <BaseMap />
          <PolygonEditor />
          <AddMarker markers={visibleMarkers} flyTo={selectedCoordinates} />
          <AddLayer layers={WMS_SOURCE ?? []} />
        </div>
      </div>

      {/* Data Table or Toggle Strip */}
      {tableVisible ? (
        <div className="flex-[0.5] w-full overflow-auto">
          {/* <MapSearchDataTable /> */}
           <MapSearchDataTable
            isLoading={isMapDataLoading}
            isError={isError}
          />
        </div>
      ) : (
        <div
          className="w-full h-10 space-x-2 flex items-center justify-center cursor-pointer border rounded shadow-sm bg-gray-50 hover:bg-gray-100 transition"
          onClick={() => setTableVisible(true)}
        >
          <span className="text-sm text-gray-600">
            Click here to expand and view the full data table with detailed
            information
          </span>
          <ChevronUp size={20} className="text-sm text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default Page;
