"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import useMapStore from "@/store/useMapStore";

interface AddMarkerProps {
  coordinates: [number, number]; // [lng, lat]
  popupText?: string;
  color?: string;
}

const AddMarker: React.FC<AddMarkerProps> = ({
  coordinates,
  popupText = "Marker",
  color = "red",
}) => {
  const { mapRef } = useMapStore();
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapRef || !coordinates) return;

    const updateMarker = () => {
      if(!coordinates[0] && !coordinates[1]) return;
      // Fly to the new coordinates
      mapRef.flyTo({
        center: coordinates ,
        zoom: 4, // Optional: adjust zoom level
        speed: 1.2, // Optional: fly speed
        curve: 1.42, // Optional: curve of the fly
        essential: true,
      });

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      const marker = new maplibregl.Marker({ color })
        .setLngLat(coordinates)
        .setPopup(new maplibregl.Popup().setText(popupText))
        .addTo(mapRef);

      // Optional: open popup on hover
      const markerElement = marker.getElement();
      markerElement.addEventListener("mouseenter", () => marker.togglePopup());
      markerElement.addEventListener("mouseleave", () => marker.togglePopup());

      markerRef.current = marker;
    };

    if (mapRef.isStyleLoaded()) {
      updateMarker();
    } else {
      mapRef.once("load", updateMarker);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [mapRef, coordinates, popupText, color]);

  return null;
};

export default AddMarker;
