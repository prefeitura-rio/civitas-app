import { memo, useCallback, useMemo, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Radar } from '@/models/entities'

import { RadarItem } from './radar-item'

interface SelectedRadarsListProps {
  selectedObjects: Radar[]
  radars: Radar[] | undefined
  setSelectedObjects: (radars: Radar[] | ((prev: Radar[]) => Radar[])) => void
  setViewport: (props: {
    longitude: number
    latitude: number
    zoom: number
  }) => void
}

export const SelectedRadarsList = memo(function SelectedRadarsList({
  selectedObjects,
  radars,
  setSelectedObjects,
  setViewport,
}: SelectedRadarsListProps) {
  const radarSearchInputRef = useRef<HTMLInputElement | null>(null)

  const handleAddRadar = useCallback(() => {
    const radar = radars?.find(
      (item) => item.cetRioCode === radarSearchInputRef.current?.value,
    )
    if (radar) {
      if (
        !selectedObjects.find((item) => item.cetRioCode === radar.cetRioCode)
      ) {
        setSelectedObjects((prev) => [radar, ...prev])
      }
      radarSearchInputRef.current!.value = ''
      setViewport({
        longitude: radar.longitude,
        latitude: radar.latitude,
        zoom: 20,
      })
    }
  }, [radars, selectedObjects, setSelectedObjects, setViewport])

  const handleFocusRadar = useCallback(
    (radar: Radar) => {
      setViewport({
        longitude: radar.longitude,
        latitude: radar.latitude,
        zoom: 20,
      })
    },
    [setViewport],
  )

  const handleRemoveRadar = useCallback(
    (radar: Radar) => {
      setSelectedObjects((prev) =>
        prev.filter((item) => item.cetRioCode !== radar.cetRioCode),
      )
    },
    [setSelectedObjects],
  )

  const radarList = useMemo(() => {
    return selectedObjects.map((radar) => (
      <RadarItem
        key={radar.cetRioCode}
        radar={radar}
        onFocus={handleFocusRadar}
        onRemove={handleRemoveRadar}
      />
    ))
  }, [selectedObjects, handleFocusRadar, handleRemoveRadar])

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input ref={radarSearchInputRef} placeholder="Código CET-RIO" />
        <Button onClick={handleAddRadar}>Adicionar</Button>
      </div>
      <div className="space-y-2">{radarList}</div>
    </div>
  )
})
