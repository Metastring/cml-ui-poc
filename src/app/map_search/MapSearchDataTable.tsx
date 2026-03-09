"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";
import { Loader2, AlertCircle, Inbox, MapPin, Maximize2, Minimize2, Table2 } from "lucide-react";
import { PolygonDataItem } from "@/types/api/mapSearch.types";
import { MapSearchDataTableProps } from "@/types/app/mapSearch.types";

const MapSearchDataTable: React.FC<MapSearchDataTableProps> = ({
  isLoading,
  isError,
  onExpandFull,
  onCollapseTable,
  onRestoreSplit,
  isTableExpanded = false,
}) => {
  const queryClient = useQueryClient();
  const { setSelectedCoordinates, addVisibleMarker, removeVisibleMarker } =
    useMapSearchData();

  // Fetch polygon data from cache (mutated by SearchBar)
  const { data: polygonData = [] } = useQuery<PolygonDataItem[]>({
    queryKey: ["polygonData"],
    queryFn: () => [],
    initialData: () => queryClient.getQueryData<PolygonDataItem[]>(["polygonData"]) || [],
  });

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleRows, setVisibleRows] = useState<boolean[]>([]);

  // Keep all checked when data changes
  useEffect(() => {
    setVisibleRows(new Array(polygonData.length).fill(true));
  }, [polygonData]);

  // Add all markers on mount
  useEffect(() => {
    polygonData.forEach((row) => {
      if (row.latitude != null && row.longitude != null) {
        addVisibleMarker({
          scientificName: row.scientificName,
          lat: row.latitude,
          lng: row.longitude,
        });
      }
    });
  }, [polygonData, addVisibleMarker]);

  const handleCheckboxChange = (index: number) => {
    const row = polygonData[index];
    const { latitude: lat, longitude: lng, scientificName } = row;

    if (lat == null || lng == null) return;

    setVisibleRows((prev) => {
      const newVisibleRows = [...prev];
      newVisibleRows[index] = !prev[index];

      const hasOtherVisible = polygonData.some((r, i) => {
        return i !== index && newVisibleRows[i] && r.latitude === lat && r.longitude === lng;
      });

      if (prev[index]) {
        if (!hasOtherVisible) removeVisibleMarker({ lat, lng, scientificName });
      } else {
        addVisibleMarker({ lat, lng, scientificName });
      }

      return newVisibleRows;
    });
  };

  const handleRowClick = (row: PolygonDataItem, index: number) => {
    if (!visibleRows[index]) return;
    if (row.latitude == null || row.longitude == null) return;

    setSelectedIndex(index);
    setSelectedCoordinates({
      scientificName: row.scientificName,
      lat: row.latitude,
      lng: row.longitude,
    });
  };

  const colSpan = 12;

  const TableToolbar: React.FC<{ label: React.ReactNode }> = ({ label }) => (
    <div className="shrink-0 px-3 py-1.5 border-b border-border bg-muted/30 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground min-w-0">
        {label}
      </div>
      {(onExpandFull ?? onRestoreSplit ?? onCollapseTable) && (
        <div className="flex items-center gap-1 shrink-0">
          {isTableExpanded && onRestoreSplit ? (
            <button
              type="button"
              onClick={onRestoreSplit}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Restore split view"
              aria-label="Restore split view"
            >
              <Minimize2 size={14} />
              Restore split
            </button>
          ) : onExpandFull ? (
            <button
              type="button"
              onClick={onExpandFull}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Expand table to full height"
              aria-label="Expand table to full height"
            >
              <Maximize2 size={14} />
              Expand to full view
            </button>
          ) : null}
          {onCollapseTable && (
            <button
              type="button"
              onClick={onCollapseTable}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Collapse table"
              aria-label="Collapse table"
            >
              <Table2 size={14} />
              Collapse table
            </button>
          )}
        </div>
      )}
    </div>
  );

  const TableHeader = () => (
    <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80 border-b border-border">
      <tr>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Show
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Scientific Name
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Family
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Genus
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Species
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Author
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          State
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Continent
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Region
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Event Date
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Basis of Record
        </th>
        <th className="px-2 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
          Dataset
        </th>
      </tr>
    </thead>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <TableToolbar label="Loading…" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-5 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm font-medium">Loading results…</p>
          <p className="text-xs">Searching within your drawn region.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <TableToolbar label="Error" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-5 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-sm font-medium text-foreground">Could not load results</p>
          <p className="text-xs text-muted-foreground">Please try again or adjust your search region.</p>
        </div>
      </div>
    );
  }

  if (polygonData.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <TableToolbar label="No results" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-5 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/70" />
          <p className="text-sm font-medium text-foreground">No results yet</p>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            Select datasets, draw a region on the map, then click Search to see occurrences here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <TableToolbar
        label={
          <>
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>
              {polygonData.length} result{polygonData.length !== 1 ? "s" : ""}
            </span>
          </>
        }
      />
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="min-w-full text-sm text-left text-foreground">
        <TableHeader />
        <tbody className="divide-y divide-border">
          {polygonData.map((row, index) => {
            const isSelected = selectedIndex === index;
            const isVisible = visibleRows[index];

            return (
              <tr
                key={index}
                className={`transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "hover:bg-muted/50"
                } ${!isVisible ? "opacity-60" : ""}`}
                onClick={() => handleRowClick(row, index)}
              >
                <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isVisible}
                    onCheckedChange={() => handleCheckboxChange(index)}
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap font-medium text-foreground">
                  {row.scientificName || row.scientific_name || "—"}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.family || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.genus || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.species || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.author || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.state || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.continent || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.region || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.eventDate || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">{row.basisOfRecord || "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {row.dataset?.toUpperCase() ?? "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default MapSearchDataTable;
