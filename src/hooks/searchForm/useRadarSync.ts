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
    console.log('🔄 useRadarSync - setValue effect triggered', {
      selectedObjectsCount: selectedObjects.length,
      selectedObjectsIds: selectedObjects.map((radar) => radar.cetRioCode),
    })
    setValue(
      'radarIds',
      selectedObjects.map((radar) => radar.cetRioCode),
    )
  }, [selectedObjects, setValue])

  useEffect(() => {
    console.log('🔄 useRadarSync - setSelectedObjects effect triggered', {
      hasRadars: !!radars,
      radarsCount: radars?.length,
      hasFormattedSearchParams: !!formattedSearchParams,
      selectedObjectsLength: selectedObjects.length,
      formattedSearchParamsRadarIds: formattedSearchParams?.radarIds,
    })
    
    if (radars && formattedSearchParams && selectedObjects.length === 0) {
      const ids = formattedSearchParams.radarIds || []
      console.log('🎯 useRadarSync - About to sync radars from URL', { ids })

      const selectedRadars = radars.filter((radar) =>
        ids.includes(radar.cetRioCode),
      )
      
      console.log('🎯 useRadarSync - Found radars to select', {
        selectedRadarsCount: selectedRadars.length,
        selectedRadarIds: selectedRadars.map(r => r.cetRioCode),
      })

      setSelectedObjects(selectedRadars)
    }
  }, [
    radars,
    formattedSearchParams,
    selectedObjects.length,
    setSelectedObjects,
  ])
}
