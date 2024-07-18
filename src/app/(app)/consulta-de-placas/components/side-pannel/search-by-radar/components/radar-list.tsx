import { Card, CardDescription } from '@/components/ui/card'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'
import { cn } from '@/lib/utils'
import type { Radar } from '@/models/entities'

import { TooltipInfoItem } from '../../../map/tooltip-info-item'

export function RadarList() {
  const { mapRef, deckRef, setSelectedRadar, selectedRadar } = useCarPath()
  const {
    mapStates: { radarHoverInfo, setRadarHoverInfo },
  } = useMapLayers()
  const canvasContainer = mapRef.current?.getCanvasContainer()
  const h = window.innerHeight
  const canvasWidth = canvasContainer?.clientWidth
  const objects = deckRef.current?.pickObjects({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: h,
    layerIds: ['radars'],
    maxObjects: 20,
  })

  return (
    !selectedRadar && (
      <div className="h-[calc(100%-3.25rem)] w-full space-y-2 overflow-y-scroll">
        <CardDescription>Selecione um radar:</CardDescription>

        {objects?.map((item) => {
          const props: Radar = item.object
          return (
            <Card
              className={cn(
                'p-2 hover:cursor-pointer hover:bg-secondary',
                props.cameraNumero === radarHoverInfo.object?.cameraNumero
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
              <TooltipInfoItem label="Código CET-Rio" value={props.codcet} />
              <TooltipInfoItem
                label="Número Câmera"
                value={props.cameraNumero}
              />
              <TooltipInfoItem label="locequip" value={props.locequip} />
              <TooltipInfoItem label="Bairro" value={props.bairro} />
              <TooltipInfoItem label="Logradouro" value={props.logradouro} />
              <TooltipInfoItem label="Sentido" value={props.sentido} />
            </Card>
          )
        })}
      </div>
    )
  )
}
