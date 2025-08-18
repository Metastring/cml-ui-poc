// store/useIndicatorStore.ts
import { create } from "zustand";

export type SelectedSources = {
  [indicatorId: string]: string[]; // { "indicator_1": ["source_a", "source_b"] }
};

export type VisibilityMap = {
  [key: string]: boolean; // e.g., "indicator_1-source_a": true/false
};

interface IndicatorStore {
  selectedSources: SelectedSources;
  layerVisibility: VisibilityMap;

  setSelectedSources: (
    updater: SelectedSources | ((prev: SelectedSources) => SelectedSources)
  ) => void;

  toggleVisibility: (indicatorId: string, sourceId: string) => void;
  setVisibility: (indicatorId: string, sourceId: string, value: boolean) => void;
}

const useIndicatorStore = create<IndicatorStore>((set) => ({
  selectedSources: {},
  layerVisibility: {},

  setSelectedSources: (updater) =>
    set((state) => {
      const updated =
        typeof updater === "function"
          ? updater(state.selectedSources)
          : updater;
      return { selectedSources: updated };
    }),

  toggleVisibility: (indicatorId, sourceId) =>
    set((state) => {
      const key = `${indicatorId}-${sourceId}`;
      const current = state.layerVisibility[key] ?? true;
      return {
        layerVisibility: {
          ...state.layerVisibility,
          [key]: !current,
        },
      };
    }),

  setVisibility: (indicatorId, sourceId, value) =>
    set((state) => {
      const key = `${indicatorId}-${sourceId}`;
      return {
        layerVisibility: {
          ...state.layerVisibility,
          [key]: value,
        },
      };
    }),
}));

export default useIndicatorStore;
