// store/useFederatedMapData.ts
import { create } from "zustand";

interface FederatedMapDataStore {
  selectedCoordinates: { lat: number; lng: number; label?: string } | null;
  setSelectedCoordinates: (coords: { lat: number; lng: number; label?: string }) => void;
  clearCoordinates: () => void;
}

const useFederatedMapData = create<FederatedMapDataStore>((set) => ({
  selectedCoordinates: null,
  setSelectedCoordinates: (coords) => set({ selectedCoordinates: coords }),
  clearCoordinates: () => set({ selectedCoordinates: null }),
}));

export default useFederatedMapData;
