// src/store/useAppStore.ts
import { create } from 'zustand'

interface AppState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  currentTab: string
  setCurrentTab: (tab: string) => void
}

const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  currentTab: 'Explore Polygon',
  setCurrentTab: (tab) => set({ currentTab: tab }),
}))

export default useAppStore
