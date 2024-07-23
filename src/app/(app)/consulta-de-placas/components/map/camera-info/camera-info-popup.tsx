/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'
import { cn } from '@/lib/utils'

import { TooltipInfoItem } from '../icon-tooltip/components/tooltip-info-item'

export function CameraInfoPopupCard() {
  const [isLoading, setIsLoading] = useState(true)
  const {
    layerHooks: { camerasCOR },
  } = useMapLayers()
  const { object, x, y } = camerasCOR.layerStates.hoverInfo

  useEffect(() => {
    setIsLoading(true)
  }, [object])

  return (
    <Card
      style={{
        left: x,
        top: y,
        zIndex: 1,
      }}
      className={cn(
        'pointer-events-none absolute min-w-40 max-w-96 px-3 py-4',
        object ? '' : 'hidden',
      )}
    >
      <span className="text-xs text-muted-foreground">Clique para fixar</span>
      <TooltipInfoItem label="Código" value={object?.code || ''} />
      <TooltipInfoItem label="Localização" value={object?.location || ''} />
      <TooltipInfoItem label="Zona" value={object?.zone || ''} />
      <div className="flex aspect-video w-full items-center justify-center">
        <img
          src={object?.streamingUrl}
          alt="Streaming"
          className={cn(
            'aspect-video w-full rounded-lg bg-border',
            isLoading ? 'hidden' : '',
          )}
          onLoad={() => setIsLoading(false)}
        />
        <Spinner />
      </div>
    </Card>
  )
}
