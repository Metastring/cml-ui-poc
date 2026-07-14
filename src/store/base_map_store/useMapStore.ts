import { create } from 'zustand';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import type maplibregl from 'maplibre-gl';

interface MapStore {
  mapRef: maplibregl.Map | null;
  setMapRef: (ref: maplibregl.Map | null) => void;

  shapes: FeatureCollection<Geometry, GeoJsonProperties> | null;
  setShapes: (shapes: FeatureCollection<Geometry, GeoJsonProperties>) => void;

  terraDrawInstance: unknown;
  setTerraDrawInstance: (instance: unknown) => void;
}

const useMapStore = create<MapStore>((set) => ({
  mapRef: null,
  setMapRef: (ref) => set({ mapRef: ref }),

  shapes: null,
  setShapes: (shapes) => set({ shapes }),

  terraDrawInstance: null,
  setTerraDrawInstance: (instance) => set({ terraDrawInstance: instance }),
}));

export default useMapStore;
