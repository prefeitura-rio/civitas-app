import { formatDate } from 'date-fns'

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
              value={radarHoverInfo.object.direction || ''}
            />
            <TooltipInfoItem
              label="Empresa"
              value={radarHoverInfo.object.company || ''}
            />
            <TooltipInfoItem
              label="Última detecção"
              value={
                radarHoverInfo.object.lastDetectionTime
                  ? formatDate(
                      radarHoverInfo.object.lastDetectionTime,
                      "dd/MM/yyyy 'às' HH:mm:ss",
                    )
                  : ''
              }
            />
            <TooltipInfoItem
              label="Ativo nas últimas 24 horas"
              value={radarHoverInfo.object.activeInLast24Hours ? 'Sim' : 'Não'}
            />
            <p className="text-sm text-muted-foreground">
              ⚠️ Atenção! Radares são considerados inativos se não enviarem
              dados há mais de 24 horas. No entanto, essa informação não é
              atualizada em tempo real e pode seguir desatualizada por várias
              horas.
            </p>
          </Card>
        )}
    </>
  )
}
