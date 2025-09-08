'use client'

import '@/utils/string-extensions'

import { MapPin, X } from 'lucide-react'
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
  const { setViewport } = useMap()

  const handleZoomToCamera = useCallback(() => {
    if (selectedObject) {
      setViewport({
        latitude: selectedObject.latitude,
        longitude: selectedObject.longitude,
        zoom: 18,
      })
    }
  }, [selectedObject, setViewport])

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
            Câmera{' '}
            <span className="font-extrabold text-primary">
              {selectedObject?.code}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">{`${selectedObject?.location.capitalizeFirstLetter()} - ${selectedObject?.zone.capitalizeFirstLetter()}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{selectedObject?.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Localização:</span>
              <span className="font-medium">
                {selectedObject?.location.capitalizeFirstLetter()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zona:</span>
              <span className="font-medium">
                {selectedObject?.zone.capitalizeFirstLetter()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latitude:</span>
              <span className="font-medium">
                {selectedObject?.latitude?.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Longitude:</span>
              <span className="font-medium">
                {selectedObject?.longitude?.toFixed(6)}
              </span>
            </div>
            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleZoomToCamera}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Focar na Câmera
              </Button>
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
