import { formatDate } from 'date-fns'

import { Card, CardDescription } from '@/components/ui/card'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'
import { cn } from '@/lib/utils'
import type { Radar } from '@/models/entities'

import { TooltipInfoItem } from '../../../map/icon-tooltip/components/tooltip-info-item'

export function RadarList() {
  const { deckRef, setSelectedRadar, selectedRadar } = useCarPath()
  const {
    mapStates: { radarHoverInfo, setRadarHoverInfo },
  } = useMapLayers()

  const deck = deckRef.current?.deck

  const objects = deckRef.current?.deck?.pickObjects({
    x: 0,
    y: 0,
    width: deck?.width,
    height: deck?.height,
    layerIds: ['radars'],
    maxObjects: 20,
  })

  return (
    !selectedRadar && (
      <div className="h-[calc(100%-3.25rem)] w-full space-y-2 overflow-y-scroll">
        <CardDescription>Selecione um radar:</CardDescription>

        <p className="text-sm text-muted-foreground">
          ⚠️ Atenção! Radares são considerados inativos se não enviarem dados há
          mais de 24 horas. No entanto, essa informação não é atualizada em
          tempo real e pode seguir desatualizada por várias horas.
        </p>

        {objects?.map((item, index) => {
          const props: Radar = item.object
          return (
            <Card
              key={index}
              className={cn(
                'p-2 hover:cursor-pointer hover:bg-secondary',
                props.cameraNumber === radarHoverInfo.object?.cameraNumber
                  ? 'bg-secondary'
                  : '',
              )}
              onMouseEnter={() => {
                setRadarHoverInfo(item)
              }}
              onMouseLeave={() =>
                setRadarHoverInfo({
                  ...item,
                  object: undefined,
                })
              }
              onClick={() => {
                setSelectedRadar(props)
                setRadarHoverInfo({
                  ...item,
                  object: undefined,
                })
              }}
            >
              <TooltipInfoItem
                label="Código CET-Rio"
                value={props.cetRioCode}
              />
              <TooltipInfoItem
                label="Número Câmera"
                value={props.cameraNumber}
              />
              <TooltipInfoItem label="Localização" value={props.location} />
              <TooltipInfoItem label="Bairro" value={props.district} />
              <TooltipInfoItem label="Logradouro" value={props.streetName} />
              <TooltipInfoItem label="Sentido" value={props.direction || ''} />
              <TooltipInfoItem label="Empresa" value={props.company || ''} />
              <TooltipInfoItem
                label="Última detecção"
                value={
                  props.lastDetectionTime
                    ? formatDate(
                        props.lastDetectionTime,
                        "dd/MM/yyyy 'às' HH:mm:ss",
                      )
                    : ''
                }
              />
              <TooltipInfoItem
                label="Ativo nas últimas 24 horas"
                value={props.activeInLast24Hours ? 'Sim' : 'Não'}
              />
            </Card>
          )
        })}
      </div>
    )
  )
}
