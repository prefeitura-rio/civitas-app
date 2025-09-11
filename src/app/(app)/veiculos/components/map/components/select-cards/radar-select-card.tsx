'use client'

import '@/utils/string-extensions'

import { formatDate } from 'date-fns'
import {
  AlertTriangle,
  Building,
  History,
  MapPin,
  RotateCcw,
  X,
} from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

interface RadarSelectCardProps {
  selectedObject: Radar | null
  setSelectedObject: (value: Radar | null) => void
}

export function RadarSelectCard({
  selectedObject,
  setSelectedObject,
}: RadarSelectCardProps) {
  const zoomToLocation = useMapStore((state) => state.zoomToLocation)
  const restorePreviousViewport = useMapStore(
    (state) => state.restorePreviousViewport,
  )
  const previousViewport = useMapStore((state) => state.previousViewport)

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
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-md text-center tracking-tighter">
            Radar OCR
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3 text-sm">
            <div className="flex flex-col space-y-1">
              <span className="text-muted-foreground">Código CET-Rio</span>
              <span className="font-medium">{selectedObject?.cetRioCode}</span>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" />
                <span className="text-muted-foreground">Localização</span>
              </div>
              <span className="font-medium">
                {`${selectedObject?.location} - ${selectedObject?.district}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground">Latitude</span>
                <span className="font-medium">{selectedObject?.latitude}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground">Longitude</span>
                <span className="font-medium">{selectedObject?.longitude}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1">
                <Building className="size-4 shrink-0" />
                <span className="text-muted-foreground">Empresa</span>
              </div>
              <span className="font-medium">{selectedObject?.company}</span>
            </div>

            {selectedObject?.lastDetectionTime && (
              <>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-1">
                    <History className="size-4 shrink-0" />
                    <span className="text-muted-foreground">
                      Última detecção
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatDate(
                      selectedObject?.lastDetectionTime,
                      "dd/MM/y 'às' HH:mm:ss",
                    )}
                  </span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">
                    Ativo nas últimas 24 horas
                  </span>
                  {selectedObject?.activeInLast24Hours ? (
                    <span className="font-medium text-emerald-600">Sim</span>
                  ) : (
                    <span className="font-medium text-rose-600">Não</span>
                  )}
                </div>
              </>
            )}

            {!selectedObject?.activeInLast24Hours && (
              <div className="border-l-4 border-yellow-600 bg-secondary p-2">
                <div className="flex items-start">
                  <AlertTriangle className="mr-2 mt-1 h-6 w-6 text-yellow-400" />
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-yellow-400">Atenção!</span>{' '}
                    Radares são considerados inativos se não enviarem dados há
                    mais de 24 horas. No entanto, essa informação não é
                    atualizada em tempo real e pode seguir desatualizada por
                    várias horas.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
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
