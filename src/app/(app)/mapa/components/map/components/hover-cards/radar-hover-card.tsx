'use client'
import { formatDate } from 'date-fns'
import type { PickingInfo } from 'deck.gl'
import { AlertTriangle, Building, History, MapPin } from 'lucide-react'
import React, { type Dispatch, type SetStateAction } from 'react'

import { MapHoverCard } from '@/components/custom/map-hover-card'
import { Label, Value } from '@/components/custom/typography'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Radar } from '@/models/entities'

interface HoverCardProps {
  hoveredObject: PickingInfo<Radar> | null
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}
export function RadarHoverCard({
  hoveredObject,
  setIsHoveringInfoCard,
}: HoverCardProps) {
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
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2">
              <div className="flex flex-col">
                <Label>Número Câmera</Label>
                <Value>{hoveredObject.object.cameraNumber}</Value>
              </div>

              <div className="flex flex-col">
                <Label>Código CET-Rio</Label>
                <Value>{hoveredObject.object.cetRioCode}</Value>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <MapPin className="shinrk-0 size-3.5" />
                <Label>Localização</Label>
              </div>
              <Value>{`${hoveredObject.object.location} - ${hoveredObject.object.district}`}</Value>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <Label>Latitude</Label>
                <Value>{hoveredObject.object.latitude}</Value>
              </div>
              <div className="flex flex-col">
                <Label>Longitude</Label>
                <Value>{hoveredObject.object.longitude}</Value>
              </div>
              {/* {radar.district && (
                <div className="">
                  <Label>Bairro: </Label>
                  <Value>{radar.district}</Value>
                </div>
              )} */}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Building className="size-4 shrink-0" />
                  <Label>Empresa</Label>
                </div>
                <Value>{hoveredObject.object.company}</Value>
              </div>
              {hoveredObject.object.lastDetectionTime && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      {/* <Calendar className="size-4 shrink-0" /> */}
                      <History
                        className={cn(
                          'size-4 shrink-0',
                          // radar.activeInLast24Hours
                          //   ? 'text-emerald-600'
                          //   : 'text-rose-600',
                        )}
                      />
                      <Label>Última detecção</Label>
                    </div>
                    <Value>
                      {formatDate(
                        hoveredObject.object.lastDetectionTime,
                        "dd/MM/y 'às' HH:mm:ss",
                      )}
                    </Value>
                  </div>
                  <div className="flex flex-col">
                    <Label>Ativo nas últimas 24 horas</Label>
                    {hoveredObject.object.activeInLast24Hours ? (
                      <Value className="text-emerald-600">Sim</Value>
                    ) : (
                      <Value className="text-rose-600">Não</Value>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-l-4 border-yellow-600 bg-secondary p-2">
              <div className="flex items-start">
                <AlertTriangle className="mr-2 mt-1 h-6 w-6 text-yellow-400" />
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-yellow-400">Atenção!</span>{' '}
                  Radares são considerados inativos se não enviarem dados há
                  mais de 24 horas. No entanto, essa informação não é atualizada
                  em tempo real e pode seguir desatualizada por várias horas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MapHoverCard>
  )
}
