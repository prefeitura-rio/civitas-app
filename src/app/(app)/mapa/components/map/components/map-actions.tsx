import type { Dispatch, SetStateAction } from 'react'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useMap } from '@/hooks/use-contexts/use-map-context'

interface Switches {
  id: string
  label: string
  checked: boolean
  onCheckedChange: Dispatch<SetStateAction<boolean>>
}

export function MapActions() {
  const {
    layers: { camerasCOR, radars, wazePoliceAlerts, trips, agents },
    isMapStyleSatellite,
    setIsMapStyleSatellite,
  } = useMap()

  const fixedSwitches: Switches[] = [
    {
      id: 'mapStyle',
      label: 'Satélite',
      checked: isMapStyleSatellite,
      onCheckedChange: setIsMapStyleSatellite,
    },
    {
      id: 'cameras',
      label: 'Câmeras',
      checked: camerasCOR.layerStates.isVisible,
      onCheckedChange: camerasCOR.layerStates.setIsVisible,
    },
    {
      id: 'radars',
      label: 'Radares',
      checked: radars.layerStates.isVisible,
      onCheckedChange: radars.layerStates.setIsVisible,
    },
    {
      id: 'waze-police-alerts',
      label: 'Alerta de polícia (Waze)',
      checked: wazePoliceAlerts.layerStates.isVisible,
      onCheckedChange: wazePoliceAlerts.layerStates.setIsVisible,
    },
    {
      id: 'agents',
      label: 'Agentes',
      checked: agents.layerStates.isVisible,
      onCheckedChange: agents.layerStates.setIsVisible,
    },
  ]

  const tripRelatedSwitches: Switches[] = [
    // {
    //   id: 'lines',
    //   label: 'Linhas',
    //   checked: trips.layersState.isLinesEnabled,
    //   onCheckedChange: trips.layersState.setIsLinesEnabled,
    // },
    // {
    //   id: 'iconColor',
    //   label: 'Pontos com gradiente',
    //   checked: trips.layersState.isIconColorEnabled,
    //   onCheckedChange: trips.layersState.setIsIconColorEnabled,
    // },
  ]

  return (
    <Card className="absolute right-2 top-2 flex flex-col gap-2 whitespace-nowrap bg-card p-2 tracking-tighter">
      {fixedSwitches.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-2">
          <Switch
            id={item.id}
            size="sm"
            checked={item.checked}
            onCheckedChange={item.onCheckedChange}
          />
          <Label htmlFor={item.id} className="text-xs">
            {item.label}
          </Label>
        </div>
      ))}

      {trips.selectedTrip && (
        <>
          {tripRelatedSwitches.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2"
            >
              <Switch
                id={item.id}
                size="sm"
                checked={item.checked}
                onCheckedChange={item.onCheckedChange}
              />
              <Label htmlFor={item.id} className="text-xs">
                {item.label}
              </Label>
            </div>
          ))}
        </>
      )}
    </Card>
  )
}
