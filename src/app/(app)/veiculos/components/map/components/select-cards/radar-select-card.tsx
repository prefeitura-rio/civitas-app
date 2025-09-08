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
import type { Radar } from '@/models/entities'

interface RadarSelectCardProps {
  selectedObject: Radar | null
  setSelectedObject: (value: Radar | null) => void
}

export function RadarSelectCard({
  selectedObject,
  setSelectedObject,
}: RadarSelectCardProps) {
  const { zoomToLocation, restorePreviousViewport, previousViewport } = useMap()

  const handleZoomToRadar = useCallback(() => {
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
  return (
    <Card
      className={cn(
        'absolute right-2 top-2 w-72 tracking-tighter',
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
            Radar{' '}
            <span className="font-extrabold text-primary">
              {selectedObject?.cetRioCode}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">{`${selectedObject?.location?.capitalizeFirstLetter() || ''} - ${selectedObject?.district?.capitalizeFirstLetter() || ''}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">
                  Localização:
                </span>
                <div className="font-medium">
                  {selectedObject?.location?.capitalizeFirstLetter() || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Bairro:</span>
                <div className="font-medium">
                  {selectedObject?.district?.capitalizeFirstLetter() || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Empresa:</span>
                <div className="font-medium">
                  {selectedObject?.company || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status:</span>
                <div
                  className={cn(
                    'text-sm font-medium',
                    selectedObject?.activeInLast24Hours
                      ? 'text-emerald-600'
                      : 'text-rose-600',
                  )}
                >
                  {selectedObject?.activeInLast24Hours ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>
            {selectedObject?.lastDetectionTime && (
              <div>
                <span className="text-xs text-muted-foreground">
                  Última detecção:
                </span>
                <div className="text-sm font-medium">
                  {new Date(selectedObject.lastDetectionTime).toLocaleString(
                    'pt-BR',
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleZoomToRadar}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Focar no Radar
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
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
