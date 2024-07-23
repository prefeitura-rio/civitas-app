import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

export function MapActions() {
  const { selectedTrip } = useCarPath()
  const {
    layerHooks: { camerasCOR },
    mapStates: {
      isIconColorEnabled,
      setIsIconColorEnabled,
      isLinesEnabled,
      setIsLinesEnabled,
      isMapStyleSatellite,
      setIsMapStyleSatellite,
      isRadarsEnabled,
      setIsRadarsEnabled,
      isWazePoliceAlertsLayerEnabled,
      setIsWazePoliceAlertsLayerEnabled,
    },
  } = useMapLayers()

  const fixedSwitches = [
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
      checked: isRadarsEnabled,
      onCheckedChange: setIsRadarsEnabled,
    },
    {
      id: 'waze-police-alerts',
      label: 'Alerta de polícia (Waze)',
      checked: isWazePoliceAlertsLayerEnabled,
      onCheckedChange: setIsWazePoliceAlertsLayerEnabled,
    },
  ]

  const tripRelatedSwitches = [
    {
      id: 'lines',
      label: 'Linhas',
      checked: isLinesEnabled,
      onCheckedChange: setIsLinesEnabled,
    },
    {
      id: 'iconColor',
      label: 'Pontos com gradiente',
      checked: isIconColorEnabled,
      onCheckedChange: setIsIconColorEnabled,
    },
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

      {selectedTrip && (
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
