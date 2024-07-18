/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
// import { useEffect, useState } from 'react'

import type { PickingInfo } from '@deck.gl/core'
import { useEffect, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { CameraCor } from '@/models/entities'

import { TooltipInfoItem } from '../tooltip-info-item'

export function CameraInfoPopupCard({ x, y, object }: PickingInfo<CameraCor>) {
  const [isLoading, setIsLoading] = useState(true)

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
