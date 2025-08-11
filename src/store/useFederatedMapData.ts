import { create } from "zustand";

interface MarkerData {
  lat: number;
  lng: number;
  label?: string;
}

interface FederatedMapDataStore {
  selectedCoordinates: MarkerData | null;
  visibleMarkers: MarkerData[];
  setSelectedCoordinates: (coords: MarkerData) => void;
  addVisibleMarker: (coords: MarkerData) => void;
  removeVisibleMarker: (coords: MarkerData) => void;
  clearCoordinates: () => void;
}

const useFederatedMapData = create<FederatedMapDataStore>((set) => ({
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
        (marker) =>
          marker.lat !== coords.lat || marker.lng !== coords.lng
      ),
    })),
  clearCoordinates: () => set({ selectedCoordinates: null }),
}));

export default useFederatedMapData;
