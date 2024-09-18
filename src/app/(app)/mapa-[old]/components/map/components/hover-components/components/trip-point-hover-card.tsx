import { format } from 'date-fns'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { MapHoverCard } from '@/components/custom/map-hover-card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function TripPointHoverCard() {
  const {
    layers: {
      trips: {
        layersState: {
          iconHoverInfo: { object, x, y, viewport },
        },
      },
    },
  } = useMap()
  return (
    <MapHoverCard x={x} y={y} object={object} viewport={viewport}>
      {object && (
        <>
          <TooltipInfoItem
            label="Data"
            value={format(new Date(object?.startTime), "dd/MM/yyyy 'às' HH:mm")}
          />
          <TooltipInfoItem label="Bairro" value={object.district} />
          <TooltipInfoItem label="Localidade" value={object.location} />
          <TooltipInfoItem label="Sentido" value={object.direction} />
          {object.secondsToNextPoint && (
            <TooltipInfoItem
              label="Intervalo até o próximo ponto"
              value={
                String((object.secondsToNextPoint / 60).toFixed(0)) + ' min'
              }
            />
          )}
        </>
      )}
    </MapHoverCard>
  )
}
