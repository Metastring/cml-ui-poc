"use client";

import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";
import useMapStore from "@/store/base_map_store/useMapStore";

/**
 * Fly-to flow:
 * - Page passes flyTo={selectedCoordinates} from the store (e.g. map search table row click).
 * - When flyTo is set with valid lat/lng, this effect runs mapRef.flyTo(center, zoom) so the map pans to that point.
 * - We only fly when lat/lng are finite; otherwise we skip (avoids flying to 0,0 when data has no coordinates).
 */

interface AddMarkerProps {
  markers: {
    lat: number;
    lng: number;
    label?: string;
  }[];
  flyTo?: {
    lat: number;
    lng: number;
  } | null;
}

const keyMap: Record<string, string> = {
  dataset: "Dataset Source",
  scientificName: "Scientific Name",
  lat: "Latitude",
  lng: "Longitude",
  long: "Longitude",
  eventDate: "Event Date",
  basisOfRecord: "Basis of Record",
};

// If you also want to map dataset values to full names
const datasetMap: Record<string, string> = {
  gbif: "Global Biodiversity Information Facility",
  cpmp: "CPMP Botanical Source",
  kew: "Kew Plant Database",
};

const AddMarker: React.FC<AddMarkerProps> = ({ markers, flyTo }) => {
  const { mapRef } = useMapStore();


  useEffect(() => {
    if (!mapRef) return;

    const markerRefs: maplibregl.Marker[] = [];

    // markers.forEach((marker) => {
    //   const isFlyingTo =
    //     flyTo?.lat === marker.lat && flyTo?.lng === marker.lng;

    //   const m = new maplibregl.Marker({
    //     color: isFlyingTo ? "blue" : "red", // 🔵 Change color if flying to this marker
    //   })
    //     .setLngLat([marker.lng, marker.lat])

    //     .setPopup(new maplibregl.Popup().setText(marker.label || "Marker"))
    //     .addTo(mapRef);

    //   // Raise flying-to marker visually
    //   if (isFlyingTo) {
    //     // Shift marker slightly upwards to separate visually if overlapping
    //     m.setOffset([0, -15]);

    //     // Increase z-index so it's on top
    //     const el = m.getElement();
    //     el.style.zIndex = "1000";
    //   }

    //   // Show popup on hover
    //   const el = m.getElement();
    //   el.addEventListener("mouseenter", () => m.togglePopup());
    //   el.addEventListener("mouseleave", () => m.togglePopup());

    //   markerRefs.push(m);
    // });

    markers.forEach((marker) => {
      const isFlyingTo = flyTo?.lat === marker.lat && flyTo?.lng === marker.lng;

      const m = new maplibregl.Marker({
        color: isFlyingTo ? "blue" : "red",
      })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(
          new maplibregl.Popup({ maxWidth: "300px" }).setHTML(`
           <div style="font-family: sans-serif; font-size: 14px; padding: 8px; max-height: 200px; overflow-y: auto; word-wrap: break-word;">
    <ul style="padding-left: 8px; margin: 0;">
      ${Object.entries(marker)
        .filter(
          ([, value]) => value !== undefined && value !== null && value !== ""
        )
        .map(([key, value]) => {
          const displayKey = keyMap[key] || key; // map key
          let displayValue = value;

          // Map dataset values
          if (key === "dataset" && datasetMap[value as string]) {
            displayValue = datasetMap[value as string];
          }

          return `<li><strong>${displayKey}:</strong> ${displayValue}</li>`;
        })
        .join("")}
    </ul>
  </div>
        `)
        )
        .addTo(mapRef);

      if (isFlyingTo) {
        m.setOffset([0, -15]);
        const el = m.getElement();
        el.style.zIndex = "1000";
      }

      const el = m.getElement();
      el.addEventListener("mouseenter", () => m.togglePopup());
      el.addEventListener("mouseleave", () => m.togglePopup());

      markerRefs.push(m);
    });

    // 🛫 Fly to point only when we have valid coordinates (avoids flying to 0,0 when lat/lng are missing)
    const hasValidCoords =
      flyTo != null &&
      Number.isFinite(flyTo.lat) &&
      Number.isFinite(flyTo.lng);
    if (hasValidCoords) {
      mapRef.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: 10,
        speed: 1.2,
        curve: 1.42,
        essential: true,
      });
    }

    return () => {
      markerRefs.forEach((marker) => marker.remove());
    };
  }, [mapRef, markers, flyTo]);

  return null;
};

export default AddMarker;
