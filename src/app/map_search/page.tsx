"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Map,
  Table2,
} from "lucide-react";
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
import InstructionPopover from "@/element/popover/InstructionPopover";

const Page = () => {
  const [tableVisible, setTableVisible] = useState(false);
  const [tableExpanded, setTableExpanded] = useState(false);
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
    <div className="w-full h-screen flex flex-col bg-background overflow-hidden">
      <div className="relative flex flex-1 min-h-0 w-full">
        {/* Sidebar: search panel and controls */}
        {sidebarVisible ? (
          <aside className="w-[350px] shrink-0 flex flex-col border-r border-border bg-card">
            {/* Header: Map Search + View data table */}
            <header className="shrink-0 border-b border-border bg-muted/20">
              <div className="flex flex-nowrap items-center justify-between gap-2 px-3 py-2.5 min-h-[40px]">
                <InstructionPopover title="Map Search" icon={<Map className="h-4 w-4" />}>
                  <p>
                    Map Search lets you explore data on the map. Select datasets, draw a region or search by location, and view results on the map or in the data table.
                  </p>
                </InstructionPopover>
                <button
                  type="button"
                  onClick={() => setTableVisible((prev) => !prev)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    tableVisible
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={tableVisible ? "Hide data table" : "Show data table"}
                  aria-label={tableVisible ? "Hide data table" : "Show data table"}
                >
                  <Table2 size={14} />
                  <span className="whitespace-nowrap">View data table</span>
                  {tableVisible ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
              </div>
            </header>

            {/* Sidebar content */}
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <MapSearchBar
                onSearch={() => setTableVisible(true)}
                mutate={mutate}
                clearDataMapSearchData={clearDataMapSearchData}
                isMapDataLoading={isMapDataLoading}
              />
            </div>
          </aside>
        ) : null}

        {/* Main: map + results; floating sidebar toggle on the right part (left edge of main) */}
        <main className="group/main relative flex-1 min-w-0 flex flex-col p-2 gap-2 overflow-hidden bg-muted/20">
          {/* Floating sidebar toggle — text shows on hover */}
          {sidebarVisible ? (
            <button
              type="button"
              onClick={() => setSidebarVisible(false)}
              className="absolute left-1/2 top-4 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-medium text-foreground shadow-md border border-border hover:bg-muted/80 hover:shadow-lg transition-all"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <ChevronsLeft size={18} />
              <span>Close sidebar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarVisible(true)}
              className="absolute left-1/2 top-4 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-medium text-foreground shadow-md border border-border hover:bg-muted/80 hover:shadow-lg transition-all"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <ChevronsRight size={18} />
              <span>Open sidebar</span>
            </button>
          )}
          {!tableExpanded && (
            <div
              className={`relative rounded-lg overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 ${
                tableVisible ? "flex-1 min-h-[240px]" : "flex-1 min-h-0"
              }`}
            >
              <BaseMap />
              <PolygonEditor />
              <AddMarker markers={visibleMarkers} flyTo={selectedCoordinates} />
              <AddLayer layers={WMS_SOURCE ?? []} />
            </div>
          )}
          {tableVisible && (
            <div
              className={`min-h-0 flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 ${
                tableExpanded ? "flex-1 min-h-0" : "flex-[0_1_42%]"
              }`}
            >
              <MapSearchDataTable
                isLoading={isMapDataLoading}
                isError={isError}
                onExpandFull={() => setTableExpanded(true)}
                onRestoreSplit={() => setTableExpanded(false)}
                onCollapseTable={() => { setTableVisible(false); setTableExpanded(false); }}
                isTableExpanded={tableExpanded}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
