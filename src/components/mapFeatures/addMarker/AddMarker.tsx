"use client";

import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";
import useMapStore from "@/store/useMapStore";

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

const AddMarker: React.FC<AddMarkerProps> = ({ markers, flyTo }) => {
  const { mapRef } = useMapStore();

  useEffect(() => {
    if (!mapRef) return;

    const markerRefs: maplibregl.Marker[] = [];

    markers.forEach((marker) => {
      const isFlyingTo =
        flyTo?.lat === marker.lat && flyTo?.lng === marker.lng;

      const m = new maplibregl.Marker({
        color: isFlyingTo ? "blue" : "red", // 🔵 Change color if flying to this marker
      })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(new maplibregl.Popup().setText(marker.label || "Marker"))
        .addTo(mapRef);

      const el = m.getElement();
      el.addEventListener("mouseenter", () => m.togglePopup());
      el.addEventListener("mouseleave", () => m.togglePopup());

      markerRefs.push(m);
    });

    // 🛫 Perform flyTo if requested
    if (flyTo) {
      mapRef.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: 4,
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
