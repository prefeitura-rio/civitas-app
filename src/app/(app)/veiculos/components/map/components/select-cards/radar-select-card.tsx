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

import { Label, Value } from '@/components/custom/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
            Radar OCR
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="h-full w-full">
            <Separator className="mb-4 mt-1 bg-secondary" />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <Label>Código CET-Rio</Label>
                <Value>{selectedObject?.cetRioCode}</Value>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" />
                  <Label>Localização</Label>
                </div>
                <Value>{`${selectedObject?.location} - ${selectedObject?.district}`}</Value>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <Label>Latitude</Label>
                  <Value>{selectedObject?.latitude}</Value>
                </div>
                <div className="flex flex-col">
                  <Label>Longitude</Label>
                  <Value>{selectedObject?.longitude}</Value>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Building className="size-4 shrink-0" />
                  <Label>Empresa</Label>
                </div>
                <Value>{selectedObject?.company}</Value>
              </div>

              {selectedObject?.lastDetectionTime && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <History className={cn('size-4 shrink-0')} />
                      <Label>Última detecção</Label>
                    </div>
                    <Value>
                      {formatDate(
                        selectedObject?.lastDetectionTime,
                        "dd/MM/y 'às' HH:mm:ss",
                      )}
                    </Value>
                  </div>
                  <div className="flex flex-col">
                    <Label>Ativo nas últimas 24 horas</Label>
                    {selectedObject?.activeInLast24Hours ? (
                      <Value className="text-emerald-600">Sim</Value>
                    ) : (
                      <Value className="text-rose-600">Não</Value>
                    )}
                  </div>
                </div>
              )}

              {!selectedObject?.activeInLast24Hours && (
                <div className="border-l-4 border-yellow-600 bg-secondary p-2">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-2 mt-1 h-6 w-6 text-yellow-400" />
                    <p className="text-sm text-gray-300">
                      <span className="font-bold text-yellow-400">
                        Atenção!
                      </span>{' '}
                      Radares são considerados inativos se não enviarem dados há
                      mais de 24 horas. No entanto, essa informação não é
                      atualizada em tempo real e pode seguir desatualizada por
                      várias horas.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
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
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
