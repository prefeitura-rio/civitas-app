import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

export function MapActions() {
  const { selectedTrip } = useCarPath()
  const {
    mapStates: {
      isCamerasEnabled,
      isIconColorEnabled,
      isLinesEnabled,
      isMapStyleSatellite,
      isRadarsEnabled,
      setIsCamerasEnabled,
      setIsIconColorEnabled,
      setIsLinesEnabled,
      setIsMapStyleSatellite,
      setIsRadarsEnabled,
    },
  } = useMapLayers()

  return (
    <Card className="absolute right-2 top-2 flex flex-col gap-2 whitespace-nowrap bg-card p-2 tracking-tighter">
      <div className="flex items-center justify-between gap-2">
        <Switch
          id="mapStyle"
          size="sm"
          checked={isMapStyleSatellite}
          onCheckedChange={setIsMapStyleSatellite}
        />
        <Label htmlFor="mapStyle" className="text-xs">
          Satélite
        </Label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Switch
          id="mapStyle"
          size="sm"
          checked={isCamerasEnabled}
          onCheckedChange={setIsCamerasEnabled}
        />
        <Label htmlFor="mapStyle" className="text-xs">
          Câmeras
        </Label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Switch
          id="mapStyle"
          size="sm"
          checked={isRadarsEnabled}
          onCheckedChange={setIsRadarsEnabled}
        />
        <Label htmlFor="mapStyle" className="text-xs">
          Radares
        </Label>
      </div>

      {selectedTrip && (
        <>
          <div className="flex items-center justify-between gap-2">
            <Switch
              id="lines"
              size="sm"
              checked={isLinesEnabled}
              onCheckedChange={() => setIsLinesEnabled(!isLinesEnabled)}
            />
            <Label htmlFor="lines" className="text-xs">
              Linhas
            </Label>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Switch
              id="iconColor"
              size="sm"
              checked={isIconColorEnabled}
              onCheckedChange={() => setIsIconColorEnabled(!isIconColorEnabled)}
            />
            <Label htmlFor="iconColor" className="text-xs">
              Pontos com gradiente
            </Label>
          </div>
        </>
      )}
    </Card>
  )
}
