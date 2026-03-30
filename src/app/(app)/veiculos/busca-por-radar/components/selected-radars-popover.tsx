import { MapPinIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Radar } from '@/models/entities'

import { SelectedRadarsHeader } from './selected-radars-header'
import { SelectedRadarsList } from './selected-radars-list'

type SelectedRadarsPopoverProps = {
  selectedRadarIds: string[]
  selectedRadars: Radar[]
  radars: Radar[] | undefined
  setSelectedObjects: (radars: Radar[] | ((prev: Radar[]) => Radar[])) => void
  setViewport: (props: {
    longitude: number
    latitude: number
    zoom: number
  }) => void
}

export function SelectedRadarsPopover({
  selectedRadarIds,
  selectedRadars,
  radars,
  setSelectedObjects,
  setViewport,
}: SelectedRadarsPopoverProps) {
  const [searchValue, setSearchValue] = useState('')

  const handleAddRadar = useCallback(() => {
    const normalizedCode = searchValue.trim()
    if (!normalizedCode) {
      return
    }

    const radar = radars?.find((item) => item.cetRioCode === normalizedCode)

    if (!radar) {
      return
    }

    if (!selectedRadarIds.includes(radar.cetRioCode)) {
      setSelectedObjects((prev) => [radar, ...prev])
    }

    setSearchValue('')
    setViewport({
      longitude: radar.longitude,
      latitude: radar.latitude,
      zoom: 20,
    })
  }, [radars, searchValue, selectedRadarIds, setSelectedObjects, setViewport])

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          <MapPinIcon className="mr-2 size-4 shrink-0" />
          Equipamentos ({selectedRadarIds.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={2}
        className="max-h-96 w-80 space-y-4 overflow-y-auto"
      >
        <SelectedRadarsHeader
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSubmit={handleAddRadar}
        />
        <SelectedRadarsList
          selectedRadars={selectedRadars}
          onFocus={handleFocusRadar}
          onRemove={handleRemoveRadar}
        />
      </PopoverContent>
    </Popover>
  )
}
