"use client";

import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";
import useMapStore from "@/store/base_map_store/useMapStore";

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

  //   const markers = [
  //   {
  //     id: 1,
  //     name: "City Hospital",
  //     lat: 28.6139,
  //     lng: 77.2090,
  //     category: "Healthcare",
  //     description: "24x7 Emergency Services",
  //     capacity: "500 beds",
  //     departments: "Cardiology, Neurology, Pediatrics",
  //     contact: "+91-9876543210",
  //     website: "https://cityhospital.example.com",
  //   },
  //   {
  //     id: 2,
  //     name: "Green Park",
  //     lat: 28.5562,
  //     lng: 77.1000,
  //     category: "Recreational",
  //     area: "12 acres",
  //     facilities: "Playground, Jogging Track, Lake, Food Court",
  //     opening_hours: "6 AM - 10 PM",
  //     entry_fee: "Free",
  //     events: "Yoga sessions on weekends",
  //   },
  //   {
  //     id: 3,
  //     name: "Tech Tower",
  //     lat: 28.5355,
  //     lng: 77.3910,
  //     category: "Office",
  //     floors: 25,
  //     built_year: 2015,
  //     company: "InnovateX Pvt Ltd",
  //     employees: 1500,
  //     contact: "+91-9876500000",
  //     website: "https://innovatetower.example.com",
  //   },
  //   {
  //     id: 4,
  //     name: "Metro Station",
  //     lat: 28.7041,
  //     lng: 77.1025,
  //     category: "Transport",
  //     lines: "Blue, Yellow",
  //     opened: 2005,
  //     daily_passengers: "1,20,000",
  //     facilities: "Parking, Shops, ATM",
  //     contact: "+91-1234567890",
  //   },
  //   {
  //     id: 5,
  //     name: "National Museum",
  //     lat: 28.6152,
  //     lng: 77.2097,
  //     category: "Museum",
  //     established: 1949,
  //     collections: "Artifacts, Paintings, Sculptures",
  //     entry_fee: "₹50 (Adults), ₹20 (Students)",
  //     opening_hours: "10 AM - 6 PM",
  //     website: "https://nationalmuseum.example.com",
  //     contact: "+91-1122334455",
  //   },
  // ];

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
                  ([ , value]) =>
                    value !== undefined && value !== null && value !== ""
                )
                .map(
                  ([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`
                )
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

      markerRefs.push(m);
    });

    // 🛫 Perform flyTo if requested
    if (flyTo) {
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
