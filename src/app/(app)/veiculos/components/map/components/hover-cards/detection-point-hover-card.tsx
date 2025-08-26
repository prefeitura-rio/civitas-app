'use client'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PickingInfo } from 'deck.gl'
import {
  AlertTriangle,
  Cctv,
  Clock,
  Map,
  MapPin,
  MapPinned,
  Navigation,
} from 'lucide-react'
import React, { type Dispatch, type SetStateAction } from 'react'

import { MapHoverCard } from '@/components/custom/map-hover-card'
import { Label, Value } from '@/components/custom/typography'
import { Separator } from '@/components/ui/separator'
import type { Point } from '@/models/entities'
import { haversineDistance } from '@/utils/haversine-distance'

interface HoverCardProps {
  hoveredObject: PickingInfo<Point> | null
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}
export function DetectionPointHoverCard({
  hoveredObject,
  setIsHoveringInfoCard,
}: HoverCardProps) {
  function formatSecondsToMinutes(secondsToNextPoint: number | null) {
    if (secondsToNextPoint === null) {
      return '--'
    }
    const minutes = Math.floor(secondsToNextPoint / 60)
    const seconds = secondsToNextPoint % 60
    return `${minutes}min ${seconds}s`
  }

  const distance =
    hoveredObject?.object && hoveredObject.object.to
      ? haversineDistance({
          pointA: hoveredObject.object.from,
          pointB: hoveredObject.object.to,
        })
      : 0

  return (
    <MapHoverCard hoveredObject={hoveredObject}>
      {hoveredObject && hoveredObject.object && (
        <div
          onMouseEnter={() => {
            setIsHoveringInfoCard(true)
          }}
          onMouseOut={() => {
            setIsHoveringInfoCard(false)
          }}
        >
          <h4>Informações do Radar</h4>
          <Separator className="mb-4 mt-1 bg-secondary" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <MapPin className="shinrk-0 size-3.5" />
                <Label>Localização</Label>
              </div>
              <Value>{hoveredObject.object.location}</Value>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Navigation className="shinrk-0 size-3.5" />
                  <Label>Sentido</Label>
                </div>
                <Value>{hoveredObject.object.direction}</Value>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Map className="shinrk-0 size-3.5" />
                  <Label>Bairro</Label>
                </div>
                <Value>{hoveredObject.object.district}</Value>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <MapPinned className="shinrk-0 size-3.5" />
                <Label>Coordenadas</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Value>Lat: {hoveredObject.object.from[1]}</Value>
                <Value>Lon: {hoveredObject.object.from[0]}</Value>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {/* <Calendar className="size-4 shrink-0" /> */}
                  <Clock className="size-4 shrink-0" />
                  <Label>Data e Hora</Label>
                </div>
                <Value>
                  {formatDate(
                    hoveredObject.object.startTime,
                    "dd/MM/y 'às' HH:mm:ss",
                    { locale: ptBR },
                  )}
                </Value>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Cctv className="size-4 shrink-0" />
                  <Label>Radar</Label>
                </div>
                <Value>{hoveredObject.object.cetRioCode}</Value>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <MapPin className="shinrk-0 size-3.5" />
                  <Label>Velocidade</Label>
                </div>
                <Value>{hoveredObject.object.speed} Km/h</Value>
              </div>
            </div>

            {hoveredObject.object.cloneAlert && (
              <div className="flex flex-col gap-2">
                {!!hoveredObject.object.secondsToNextPoint &&
                  hoveredObject.object.to && (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <MapPinned className="shinrk-0 size-3.5" />
                        <Label>Próximo ponto:</Label>
                      </div>
                      <div className="flex flex-col">
                        <Value>
                          Distância: {(distance / 1000).toFixed(1)}Km
                        </Value>
                        <Value>
                          Intervalo:{' '}
                          {formatSecondsToMinutes(
                            hoveredObject.object.secondsToNextPoint,
                          )}
                        </Value>
                        <Value>
                          Velocidade Média:{' '}
                          {(
                            (distance * 3.6) /
                            hoveredObject.object.secondsToNextPoint
                          ).toFixed(0)}{' '}
                          Km/h
                        </Value>
                      </div>
                    </div>
                  )}

                <div className="border-l-4 border-destructive bg-secondary p-2">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-2 mt-2 size-4 shrink-0 text-destructive" />
                    <p className="text-sm text-gray-300">
                      <span className="font-bold text-destructive">
                        Suspeita de placa clonada:
                      </span>{' '}
                      A distância entre este ponto de detecção e o próximo é
                      significativamente grande em relação ao intervalo de tempo
                      entre eles. Isso pode indicar uma possível clonagem de
                      placa, sugerindo que dois veículos distintos estejam
                      circulando simultaneamente com a mesma placa.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </MapHoverCard>
  )
}
