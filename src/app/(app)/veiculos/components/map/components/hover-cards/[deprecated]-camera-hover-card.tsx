/* eslint-disable @next/next/no-img-element */
import { type PickingInfo } from 'deck.gl'
import { Fullscreen, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { MapHoverCard } from '@/components/custom/map-hover-card'
import { Spinner } from '@/components/custom/spinner'
import { Label, Value } from '@/components/custom/typography'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { CameraCOR } from '@/models/entities'

interface HoverCardProps {
  hoveredObject: PickingInfo<CameraCOR> | null
  setIsHoveringInfoCard: (isHovering: boolean) => void
}

export function DEPRECATEDCameraHoverCard({
  hoveredObject,
  setIsHoveringInfoCard,
}: HoverCardProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
  }, [hoveredObject])

  const object = hoveredObject?.object
  return (
    <MapHoverCard hoveredObject={hoveredObject}>
      <div
        onMouseEnter={() => {
          setIsHoveringInfoCard(true)
        }}
        onMouseOut={() => {
          setIsHoveringInfoCard(false)
        }}
        className="w-full"
      >
        <h4>Informações da Câmera</h4>
        <Separator className="mb-4 mt-1 bg-secondary" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Label>Código</Label>
            <Value>{object?.code}</Value>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <MapPin className="shinrk-0 size-3.5" />
              <Label>Localização</Label>
            </div>
            <Value>{`${object?.location} - ${object?.zone}`}</Value>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <Label>Latitude</Label>
              <Value>{object?.latitude}</Value>
            </div>
            <div className="flex flex-col">
              <Label>Longitude</Label>
              <Value>{object?.longitude}</Value>
            </div>
          </div>

          <div className="relative flex aspect-video w-full items-center justify-center">
            <img
              src={object?.streamingUrl}
              alt="Streaming"
              className={cn(
                'aspect-video w-full rounded-lg bg-border',
                isLoading ? 'hidden' : '',
              )}
              onLoad={() => setIsLoading(false)}
            />
            {!isLoading && (
              <Button
                variant="ghost"
                asChild
                className="absolute bottom-1 right-1 h-6 p-1"
              >
                <Link
                  href={object?.streamingUrl || ''}
                  className="text-xs text-muted-foreground"
                  target="_blank"
                >
                  <Fullscreen className="h-4 w-4 text-primary" />
                </Link>
              </Button>
            )}
            {isLoading && <Spinner className="size-10" />}
          </div>
        </div>
      </div>
    </MapHoverCard>
  )
}
