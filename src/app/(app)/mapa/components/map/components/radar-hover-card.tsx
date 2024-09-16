'use client'
import { formatDate } from 'date-fns'
import type { Viewport } from 'deck.gl'
import React, { type Dispatch, type SetStateAction } from 'react'

import { TooltipInfoItem } from '@/app/(app)/mapa-[old]/components/common/tooltip-info-item'
import { MapHoverCard } from '@/components/custom/map-hover-card'
import type { Radar } from '@/models/entities'

interface HoverCardProps {
  radar: Radar
  x: number
  y: number
  viewport: Viewport | undefined
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}
export function RadarHoverCard({
  radar,
  viewport,
  x,
  y,
  setIsHoveringInfoCard,
}: HoverCardProps) {
  return (
    <MapHoverCard x={x} y={y} object={radar} viewport={viewport}>
      {radar && (
        <div
          onMouseEnter={() => {
            setIsHoveringInfoCard(true)
          }}
          onMouseLeave={() => {
            setIsHoveringInfoCard(false)
          }}
        >
          <TooltipInfoItem label="Número Câmera" value={radar.cameraNumber} />
          <TooltipInfoItem
            label="Código CET-Rio"
            value={radar.cetRioCode || ''}
          />
          <TooltipInfoItem label="Localização" value={radar.location || ''} />
          <TooltipInfoItem label="Latitude" value={radar.latitude.toString()} />
          <TooltipInfoItem
            label="Longitude"
            value={radar.longitude.toString()}
          />
          <TooltipInfoItem label="Bairro" value={radar.district || ''} />
          <TooltipInfoItem label="Logradouro" value={radar.streetName || ''} />
          <TooltipInfoItem label="Sentido" value={radar.direction || ''} />
          <TooltipInfoItem label="Empresa" value={radar.company || ''} />
          <TooltipInfoItem
            label="Última detecção"
            value={
              radar.lastDetectionTime
                ? formatDate(
                    radar.lastDetectionTime,
                    "dd/MM/yyyy 'às' HH:mm:ss",
                  )
                : ''
            }
          />
          <TooltipInfoItem
            label="Ativo nas últimas 24 horas"
            value={radar.activeInLast24Hours ? 'Sim' : 'Não'}
          />
          <p className="text-sm text-muted-foreground">
            ⚠️ Atenção! Radares são considerados inativos se não enviarem dados
            há mais de 24 horas. No entanto, essa informação não é atualizada em
            tempo real e pode seguir desatualizada por várias horas.
          </p>
        </div>
      )}
    </MapHoverCard>
  )
}
