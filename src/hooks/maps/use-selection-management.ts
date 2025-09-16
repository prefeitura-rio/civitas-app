'use client'

import { useEffect } from 'react'

import type { CameraCOR, Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

interface UseSelectionManagementProps {
  selectedRadar: Radar | null
  selectedCamera: CameraCOR | null
  setSelectedCamera: (camera: CameraCOR | null) => void
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
