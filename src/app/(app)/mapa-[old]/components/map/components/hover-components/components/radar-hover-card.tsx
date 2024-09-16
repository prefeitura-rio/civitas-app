import { formatDate } from 'date-fns'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { MapHoverCard } from '@/components/custom/map-hover-card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function RadarHoverCard() {
  const {
    layers: {
      radars: {
        layerStates: {
          hoverInfo: { object, x, y, viewport },
        },
      },
    },
  } = useMap()

  return (
    <MapHoverCard x={x} y={y} object={object} viewport={viewport}>
      {object && (
        <>
          <TooltipInfoItem label="Número Câmera" value={object.cameraNumber} />
          <TooltipInfoItem
            label="Código CET-Rio"
            value={object.cetRioCode || ''}
          />
          <TooltipInfoItem label="Localização" value={object.location || ''} />
          <TooltipInfoItem
            label="Latitude"
            value={object.latitude.toString()}
          />
          <TooltipInfoItem
            label="Longitude"
            value={object.longitude.toString()}
          />
          <TooltipInfoItem label="Bairro" value={object.district || ''} />
          <TooltipInfoItem label="Logradouro" value={object.streetName || ''} />
          <TooltipInfoItem label="Sentido" value={object.direction || ''} />
          <TooltipInfoItem label="Empresa" value={object.company || ''} />
          <TooltipInfoItem
            label="Última detecção"
            value={
              object.lastDetectionTime
                ? formatDate(
                    object.lastDetectionTime,
                    "dd/MM/yyyy 'às' HH:mm:ss",
                  )
                : ''
            }
          />
          <TooltipInfoItem
            label="Ativo nas últimas 24 horas"
            value={object.activeInLast24Hours ? 'Sim' : 'Não'}
          />
          <p className="text-sm text-muted-foreground">
            ⚠️ Atenção! Radares são considerados inativos se não enviarem dados
            há mais de 24 horas. No entanto, essa informação não é atualizada em
            tempo real e pode seguir desatualizada por várias horas.
          </p>
        </>
      )}
    </MapHoverCard>
  )
}
