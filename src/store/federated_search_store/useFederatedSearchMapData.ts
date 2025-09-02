import { create } from "zustand";

interface MarkerData {
  lat: number;
  lng: number;
  scientificName?: string;
  dataset?: string;
  eventDate?: string;
  basisOfRecord?: string;
}

interface FederatedSearchMapDataStore {
  selectedCoordinates: MarkerData | null;
  visibleMarkers: MarkerData[];
  setSelectedCoordinates: (coords: MarkerData) => void;
  addVisibleMarker: (coords: MarkerData) => void;
  removeVisibleMarker: (coords: MarkerData) => void;
  removeMarkerByName: (scientificName: string) => void; // ✅ new
  clearCoordinates: () => void;
}

const useFederatedSearchMapData = create<FederatedSearchMapDataStore>((set) => ({
  selectedCoordinates: null,
  visibleMarkers: [],

  setSelectedCoordinates: (coords) => set({ selectedCoordinates: coords }),

  addVisibleMarker: (coords) =>
    set((state) => ({
      visibleMarkers: [...state.visibleMarkers, coords],
    })),

  removeVisibleMarker: (coords) =>
    set((state) => ({
      visibleMarkers: state.visibleMarkers.filter(
        (marker) => marker.lat !== coords.lat || marker.lng !== coords.lng
      ),
    })),

  // ✅ remove all markers for a species
  removeMarkerByName: (scientificName) =>
    set((state) => ({
      visibleMarkers: state.visibleMarkers.filter(
        (marker) => marker.scientificName !== scientificName
      ),
    })),

  clearCoordinates: () => set({ selectedCoordinates: null, visibleMarkers: [] }),
}));

export default useFederatedSearchMapData;
