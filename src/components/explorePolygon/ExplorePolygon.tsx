"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelRightOpen,
} from "lucide-react";
import SearchBar from "@/components/explorePolygon/SearchBar";
import PolygonDataTable from "@/components/explorePolygon/PolygonDataTable";
import InstructionPopover from "@/element/popover/InstructionPopover";
import BaseMap from "../map/BaseMap";
import ExternalLayers from "../mapFeatures/externalLayers/ExternalLayers";
import PolygonEditor from "../mapFeatures/polygonEditor/PolygonEditor";

const ExplorePolygon = () => {
  const [tableVisible, setTableVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="w-full h-screen p-4 space-y-4">
      {/* Top Section: Map + Sidebar */}
      <div
        className={`flex flex-col md:flex-row w-full ${
          tableVisible ? "h-1/2" : "h-[calc(100%-2.5rem)]"
        } gap-4 transition-all duration-300`}
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
            <SearchBar />
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
            <div>

            </div>
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 h-full relative rounded-lg overflow-hidden shadow-md">
          <BaseMap />
          <ExternalLayers />
          <PolygonEditor />
        </div>
      </div>

      {/* Data Table or Toggle Strip */}
      {tableVisible ? (
        <div className="w-full transition-all duration-300">
          <PolygonDataTable />
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

export default ExplorePolygon;
