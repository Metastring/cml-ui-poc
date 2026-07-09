"use client";

import React from "react";
import BaseMap from "@/components/map/BaseMap";
import AddMarker from "@/components/mapFeatures/addMarker/AddMarker";
import { cn } from "@/lib/utils";
import { SLIDE_TRANSITION } from "@/app/federated_search/utils/constants";

interface SearchMapSectionProps {
  isMapVisible: boolean;
  visibleMarkers: Array<{ lat: number; lng: number; label?: string }>;
  selectedCoordinates: { lat: number; lng: number } | null;
}

export function SearchMapSection({
  isMapVisible,
  visibleMarkers,
  selectedCoordinates,
}: SearchMapSectionProps) {
  return (
    <div
      className={cn(
        "overflow-hidden shadow-lg duration-[1100ms] ease-in-out",
        SLIDE_TRANSITION,
        isMapVisible ? "h-[50vh]" : "h-0"
      )}
    >
      {isMapVisible && (
        <div className="h-full w-full">
          <BaseMap />
          <AddMarker markers={visibleMarkers} flyTo={selectedCoordinates} />
        </div>
      )}
    </div>
  );
}
