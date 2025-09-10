import { useEffect } from 'react'

import type { Radar } from '@/models/entities'

interface UseRadarSyncProps {
  selectedObjects: Radar[]
  setSelectedObjects: (radars: Radar[] | ((prev: Radar[]) => Radar[])) => void
  radars: Radar[] | undefined
  formattedSearchParams: {
    radarIds: string[]
    date?: { from: string; to: string }
    plate?: string
  } | null
  setValue: (name: string, value: string[]) => void
}

export function useRadarSync({
  selectedObjects,
  setSelectedObjects,
  radars,
  formattedSearchParams,
  setValue,
}: UseRadarSyncProps) {
  useEffect(() => {
    setValue(
      'radarIds',
      selectedObjects.map((radar) => radar.cetRioCode),
    )
  }, [selectedObjects, setValue])

  useEffect(() => {
    if (radars && formattedSearchParams && selectedObjects.length === 0) {
      const ids = formattedSearchParams.radarIds || []

      const selectedRadars = radars.filter((radar) =>
        ids.includes(radar.cetRioCode),
      )

      setSelectedObjects(selectedRadars)
    }
  }, [
    radars,
    formattedSearchParams,
    selectedObjects.length,
    setSelectedObjects,
  ])
}
