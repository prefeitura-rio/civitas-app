'use client'

import { useEffect } from 'react'

import type { Camera, CollectionPoint } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

interface UseSelectionManagementProps {
  selectedRadar: CollectionPoint | null
  selectedCamera: Camera | null
  setSelectedCamera: (camera: Camera | null) => void
}

export function useSelectionManagement({
  selectedRadar,
  selectedCamera,
  setSelectedCamera,
}: UseSelectionManagementProps) {
  useEffect(() => {
    if (selectedCamera) {
      const { radarInfoMode, setRadarInfoMode } = useMapStore.getState()
      if (radarInfoMode) {
        setRadarInfoMode(null)
      }
    }
  }, [selectedCamera])

  useEffect(() => {
    if (selectedRadar) {
      if (selectedCamera) {
        setSelectedCamera(null)
      }
    }
  }, [selectedRadar, selectedCamera, setSelectedCamera])
}
