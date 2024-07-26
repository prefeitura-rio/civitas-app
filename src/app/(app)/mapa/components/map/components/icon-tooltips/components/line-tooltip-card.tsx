import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function TripLineTooltipCard() {
  const {
    layers: {
      trips: {
        layersState: {
          lineHoverInfo: { object, x, y },
        },
      },
    },
  } = useMap()
  const diffInSeconds = object?.secondsToNextPoint || 0
  const diffInMinutes = diffInSeconds / 60

  return (
    <>
      {object && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <TooltipInfoItem
            label="Intervalo"
            value={String(diffInMinutes.toFixed(0)) + ' min'}
          />
        </Card>
      )}
    </>
  )
}
