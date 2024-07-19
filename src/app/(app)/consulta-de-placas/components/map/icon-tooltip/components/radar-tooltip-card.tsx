import { Card } from '@/components/ui/card'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

import { TooltipInfoItem } from './tooltip-info-item'

export function RadarTooltipCard() {
  const {
    mapStates: { radarHoverInfo },
  } = useMapLayers()

  return (
    <>
      {radarHoverInfo &&
        radarHoverInfo.object &&
        (radarHoverInfo.x !== 0 || radarHoverInfo.y !== 0) && (
          <Card
            style={{ left: radarHoverInfo.x, top: radarHoverInfo.y, zIndex: 1 }}
            className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
          >
            <TooltipInfoItem
              label="Código CET-Rio"
              value={radarHoverInfo.object.cetRioCode}
            />
            <TooltipInfoItem
              label="Número Câmera"
              value={radarHoverInfo.object.cameraNumber}
            />
            <TooltipInfoItem
              label="Localização"
              value={radarHoverInfo.object.location}
            />
            <TooltipInfoItem
              label="Bairro"
              value={radarHoverInfo.object.district}
            />
            <TooltipInfoItem
              label="Logradouro"
              value={radarHoverInfo.object.streetName}
            />
            <TooltipInfoItem
              label="Sentido"
              value={radarHoverInfo.object.direction}
            />
          </Card>
        )}
    </>
  )
}
