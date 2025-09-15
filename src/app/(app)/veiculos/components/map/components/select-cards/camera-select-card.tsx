'use client'

import '@/utils/string-extensions'

import { MapPin, RotateCcw, X } from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CameraCOR } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

interface CameraSelectCardProps {
  selectedObject: CameraCOR | null
  setSelectedObject: (value: CameraCOR | null) => void
  style?: React.CSSProperties | undefined
}

export function CameraSelectCard({
  selectedObject,
  setSelectedObject,
  style,
}: CameraSelectCardProps) {
  const zoomToLocation = useMapStore((state) => state.zoomToLocation)
  const restorePreviousViewport = useMapStore(
    (state) => state.restorePreviousViewport,
  )
  const previousViewport = useMapStore((state) => state.previousViewport)

  const handleZoomToCamera = useCallback(() => {
    if (selectedObject) {
      // Força o zoom mesmo se o usuário já estiver com zoom maior
      zoomToLocation(
        selectedObject.latitude,
        selectedObject.longitude,
        18,
        true,
      )
    }
  }, [selectedObject, zoomToLocation])

  const handleRestorePreviousViewport = useCallback(() => {
    restorePreviousViewport()
  }, [restorePreviousViewport])

  const handleCloseCard = useCallback(() => {
    setSelectedObject(null)
  }, [setSelectedObject])

  const handleOpenStreaming = useCallback(() => {
    if (selectedObject?.streamingUrl) {
      window.open(selectedObject.streamingUrl, '_blank')
    }
  }, [selectedObject?.streamingUrl])
  return (
    <Card
      className={cn(
        'absolute left-2 top-2 w-72 tracking-tighter',
        !selectedObject ? 'hidden' : '',
      )}
      style={style}
    >
      <div className="relative">
        <Button
          variant="outline"
          className="absolute right-1 top-1 h-5 w-5 p-0"
          onClick={handleCloseCard}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-left text-sm font-semibold tracking-tighter">
            Câmera
          </CardTitle>
        </CardHeader>
        <div className="px-4 py-2">
          <CardDescription className="text-xs">{`${selectedObject?.location.capitalizeFirstLetter()} - ${selectedObject?.zone.capitalizeFirstLetter()}`}</CardDescription>
        </div>
        <CardContent className="px-4 py-3">
          <div className="space-y-3 text-sm">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium">Código</span>
              <span className="text-sm text-muted-foreground">
                {selectedObject?.code}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1">
                <MapPin className="size-4 shrink-0" />
                <span className="text-sm font-medium">Localização</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedObject?.location.capitalizeFirstLetter()}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium">Zona</span>
              <span className="text-sm text-muted-foreground">
                {selectedObject?.zone.capitalizeFirstLetter()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium">Latitude</span>
                <span className="text-sm text-muted-foreground">
                  {selectedObject?.latitude?.toFixed(6)}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium">Longitude</span>
                <span className="text-sm text-muted-foreground">
                  {selectedObject?.longitude?.toFixed(6)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleZoomToCamera}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Focar na Câmera
              </Button>
              {previousViewport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestorePreviousViewport}
                  title="Voltar ao zoom anterior"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedObject?.streamingUrl && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleOpenStreaming}
                >
                  Abrir Streaming
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
