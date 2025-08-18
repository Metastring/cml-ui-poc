// /store/useRecentIndicatorStore.ts
import { create } from "zustand";

interface RecentIndicator {
  indicatorId: string;
  sourceId: string;
}

interface RecentIndicatorState {
  recentIndicator: RecentIndicator | null;
  setRecentIndicator: (data: RecentIndicator) => void;
}

const useRecentIndicatorStore = create<RecentIndicatorState>((set, get) => ({
  recentIndicator: null,

  setRecentIndicator: (data) => {
    set({ recentIndicator: data });
    console.log("🟡 recentIndicator SET:", get().recentIndicator);
  },
}));

export default useRecentIndicatorStore;
