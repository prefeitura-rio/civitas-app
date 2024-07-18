import { Card } from '@/components/ui/card'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import type { Radar } from '@/models/entities'

import { TooltipInfoItem } from '../../../map/tooltip-info-item'

export function RadarList() {
  const { mapRef, deckRef } = useCarPath()
  const bbox = mapRef.current?.getBounds()
  const canvasContainer = mapRef.current?.getCanvasContainer()
  const canvasHeight = canvasContainer?.clientHeight
  const canvasWidth = canvasContainer?.clientWidth
  const objects = deckRef.current?.pickObjects({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: 944,
    layerIds: ['radars'],
    maxObjects: 20,
  })
  console.log({ bbox, objects, canvasHeight, canvasWidth })
  return (
    <div className="h-[calc(100%-3.25rem)] w-full space-y-2 overflow-y-scroll">
      {objects?.map((item) => {
        const props: Radar = item.object
        return (
          <Card className="p-2 hover:cursor-pointer hover:bg-secondary">
            <TooltipInfoItem label="Código CET-Rio" value={props.codcet} />
            <TooltipInfoItem label="Número Câmera" value={props.cameraNumero} />
            <TooltipInfoItem label="locequip" value={props.locequip} />
            <TooltipInfoItem label="Bairro" value={props.bairro} />
            <TooltipInfoItem label="Logradouro" value={props.logradouro} />
            <TooltipInfoItem label="Sentido" value={props.sentido} />
          </Card>
        )
      })}
    </div>
  )
}
