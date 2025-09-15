import { create } from 'zustand'

interface ViewportState {
  width: number
  height: number
  mapWidth: number
  mapHeight: number
  setViewportSize: (width: number, height: number) => void
  setMapSize: (width: number, height: number) => void
}

export const useViewportStore = create<ViewportState>((set) => ({
  width: 0,
  height: 0,
  mapWidth: 0,
  mapHeight: 0,
  setViewportSize: (width, height) => set({ width, height }),
  setMapSize: (width, height) => set({ mapWidth: width, mapHeight: height }),
}))
