import { useEffect, useState } from 'react'

import type { Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

interface UseRadarSyncProps {
  selectedObjects: Radar[]
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
  radars,
  formattedSearchParams,
  setValue,
}: UseRadarSyncProps) {
  const setMultipleSelectedRadars = useMapStore(
    (state) => state.setMultipleSelectedRadars,
  )
  const multipleSelectedRadars = useMapStore(
    (state) => state.multipleSelectedRadars,
  )

  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    setValue(
      'radarIds',
      selectedObjects.map((radar) => radar.cetRioCode),
    )
  }, [selectedObjects, setValue])

  useEffect(() => {
    if (!Array.isArray(multipleSelectedRadars)) {
      return
    }

    if (!isInitialLoad) {
      return
    }

    if (
      radars &&
      formattedSearchParams &&
      formattedSearchParams.radarIds?.length > 0
    ) {
      const urlRadarIds = formattedSearchParams.radarIds

      setMultipleSelectedRadars(urlRadarIds)
      setIsInitialLoad(false)
    } else if (
      formattedSearchParams &&
      formattedSearchParams.radarIds?.length === 0 &&
      Array.isArray(multipleSelectedRadars) &&
      multipleSelectedRadars.length > 0
    ) {
      setMultipleSelectedRadars([])
      setIsInitialLoad(false)
    } else if (radars && formattedSearchParams) {
      setIsInitialLoad(false)
    }
  }, [
    radars,
    formattedSearchParams,
    multipleSelectedRadars,
    setMultipleSelectedRadars,
    isInitialLoad,
  ])
}
