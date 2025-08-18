"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";

interface PolygonDataItem {
  scientificName: string;
  eventDate: string;
  basisOfRecord?: string;
  longitude: number;
  latitude: number;
}

const PolygonDataTable: React.FC = () => {
  const queryClient = useQueryClient();
  const { setSelectedCoordinates, addVisibleMarker, removeVisibleMarker } =
    useMapSearchData();

  // const { isLoading: isMapDataLoading } = useGetMapSearchData();

  // Fetch polygon data from cache (mutated by SearchBar)
  const { data: polygonData = [] } = useQuery<PolygonDataItem[]>({
    queryKey: ["polygonData"],
    queryFn: () => [],
    initialData: () => queryClient.getQueryData(["polygonData"]) || [],
  });

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleRows, setVisibleRows] = useState<boolean[]>([]);

  // Keep all checked when data changes
  useEffect(() => {
    setVisibleRows(new Array(polygonData.length).fill(true));
  }, [polygonData]);

  // Add all markers on mount
  useEffect(() => {
    polygonData.forEach((row) =>
      addVisibleMarker({
        lat: row.latitude,
        lng: row.longitude,
        label: row.scientificName,
      })
    );
  }, [polygonData, addVisibleMarker]);

  const handleCheckboxChange = (index: number) => {
    const row = polygonData[index];
    const { latitude: lat, longitude: lng, scientificName: label } = row;

    setVisibleRows((prev) => {
      const newVisibleRows = [...prev];
      newVisibleRows[index] = !prev[index];

      const hasOtherVisible = polygonData.some((r, i) => {
        return (
          i !== index &&
          newVisibleRows[i] &&
          r.latitude === lat &&
          r.longitude === lng
        );
      });

      if (prev[index]) {
        if (!hasOtherVisible) {
          removeVisibleMarker({ lat, lng, label });
        }
      } else {
        addVisibleMarker({ lat, lng, label });
      }

      return newVisibleRows;
    });
  };

  const handleRowClick = (row: PolygonDataItem, index: number) => {
    if (!visibleRows[index]) {
      return;
    }
    setSelectedIndex(index);
    setSelectedCoordinates({
      lat: row.latitude,
      lng: row.longitude,
      label: row.scientificName,
    });
  };

if (!polygonData.length) {
  return (
    <div className="h-full flex justify-center  border border-gray-300 rounded-md">
      <table className="min-w-full text-sm text-left text-gray-800 border-collapse border border-gray-300">
        <thead className="bg-gray-200 text-xs uppercase font-semibold tracking-wider border-b border-gray-300">
             <tr>
              <th className="px-6 py-4">View on Map</th>
              <th className="px-6 py-4">Scientific Name</th>
              <th className="px-6 py-4">Event Date</th>
              <th className="px-6 py-4">Basis of Record</th>
              <th className="px-6 py-4">Longitude</th>
              <th className="px-6 py-4">Latitude</th>
            </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={6} className="text-center text-gray-500 italic ">
              No data available. Please draw a polygon and select filters to search.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}





  return (
    <div className="w-full overflow-x-auto min-w-md">
      <div className="min-w-full bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-200 sticky top-0 z-10 text-xs uppercase font-semibold tracking-wider border">
            <tr>
              <th className="px-6 py-4">View on Map</th>
              <th className="px-6 py-4">Scientific Name</th>
              <th className="px-6 py-4">Event Date</th>
              <th className="px-6 py-4">Basis of Record</th>
              <th className="px-6 py-4">Longitude</th>
              <th className="px-6 py-4">Latitude</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {polygonData.map((row, index) => {
              const isSelected = selectedIndex === index;
              const isVisible = visibleRows[index];

              return (
                <tr
                  key={index}
                  className={`transition-colors duration-200 ${
                    isSelected ? "bg-blue-100 text-blue-900" : "hover:bg-blue-50"
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
                  <td className="px-6 py-4 whitespace-nowrap">{row.scientificName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.eventDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.basisOfRecord || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.longitude}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.latitude}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolygonDataTable;
