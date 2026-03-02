"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";
import { Loader2 } from "lucide-react";
import { PolygonDataItem } from "@/types/api/mapSearch.types";
import { MapSearchDataTableProps } from "@/types/app/mapSearch.types";

const MapSearchDataTable: React.FC<MapSearchDataTableProps> = ({
  isLoading,
  isError,
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

  const TableHeader = () => (
    <thead className="bg-muted font-semibold tracking-wider border-b border-border">
      <tr>
        <th className="px-6 py-4 text-foreground">View Distribution</th>
        <th className="px-6 py-4 text-foreground">Scientific Name</th>
        <th className="px-6 py-4 text-foreground">Family</th>
        <th className="px-6 py-4 text-foreground">Genus</th>
        <th className="px-6 py-4 text-foreground">Species</th>
        <th className="px-6 py-4 text-foreground">Author</th>
        <th className="px-6 py-4 text-foreground">State</th>
        <th className="px-6 py-4 text-foreground">Continent</th>
        <th className="px-6 py-4 text-foreground">Region</th>
        <th className="px-6 py-4 text-foreground">Event Date</th>
        <th className="px-6 py-4 text-foreground">Basis of Record</th>
        <th className="px-6 py-4 text-foreground">Dataset</th>
      </tr>
    </thead>
  );

  if (isLoading) {
    return (
      <div className="flex h-full justify-center rounded-2xl">
        <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
          <TableHeader />
          <tbody>
            <tr>
              <td colSpan={5} className="text-center text-muted-foreground italic">
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="animate-spin mr-2" />
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full justify-center rounded-2xl">
        <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
          <TableHeader />
          <tbody>
            <tr>
              <td colSpan={5} className="text-center text-destructive italic py-6">
                Oops! Something went wrong while loading data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (polygonData.length === 0) {
    return (
      <div className="flex h-full justify-center rounded-2xl">
        <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
          <TableHeader />
          <tbody>
            <tr>
              <td colSpan={5} className="text-center text-muted-foreground italic py-6">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto min-w-md">
      <div className="min-w-full bg-card shadow-xl rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm text-left text-foreground">
          <TableHeader />
          <tbody className="divide-y divide-border">
            {polygonData.map((row, index) => {
              const isSelected = selectedIndex === index;
              const isVisible = visibleRows[index];

              return (
                <tr
                  key={index}
                  className={`transition-colors duration-200 ${
                    isSelected ? "bg-primary/10 text-foreground" : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleRowClick(row, index)}
                >
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={isVisible}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.scientificName || row.scientific_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.eventDate || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.basisOfRecord || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.family || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.genus || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.species || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.author || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.state || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.continent || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.region || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.dataset.toUpperCase()}</td>
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
