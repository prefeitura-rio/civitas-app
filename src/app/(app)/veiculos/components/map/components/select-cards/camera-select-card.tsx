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
import { useMap } from '@/hooks/useContexts/use-map-context'
import { cn } from '@/lib/utils'
import type { CameraCOR } from '@/models/entities'

interface CameraSelectCardProps {
  selectedObject: CameraCOR | null
  setSelectedObject: (value: CameraCOR | null) => void
}

export function CameraSelectCard({
  selectedObject,
  setSelectedObject,
}: CameraSelectCardProps) {
  const { zoomToLocation, restorePreviousViewport, previousViewport } = useMap()

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
    >
      <div className="relative">
        <Button
          variant="outline"
          className="absolute right-1 top-1 h-5 w-5 p-0"
          onClick={handleCloseCard}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="px-4 py-4">
          <CardTitle className="text-md text-center tracking-tighter">
            Câmera
          </CardTitle>
          <CardDescription className="text-xs">{`${selectedObject?.location.capitalizeFirstLetter()} - ${selectedObject?.zone.capitalizeFirstLetter()}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Código</span>
              <span className="font-medium">{selectedObject?.code}</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" />
                <span className="text-muted-foreground">Localização</span>
              </div>
              <span className="font-medium">
                {selectedObject?.location.capitalizeFirstLetter()}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-muted-foreground">Zona</span>
              <span className="font-medium">
                {selectedObject?.zone.capitalizeFirstLetter()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Latitude</span>
                <span className="font-medium">
                  {selectedObject?.latitude?.toFixed(6)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Longitude</span>
                <span className="font-medium">
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
