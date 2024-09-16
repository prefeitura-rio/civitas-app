import React from 'react'

import { Button } from '@/components/ui/button'
import type { Radar } from '@/models/entities'

interface HoverCardProps {
  radar: Radar
  selectRadar: (radar: Radar) => void
}

export default function ClickCard({ radar, selectRadar }: HoverCardProps) {
  return (
    <div className="w-96 rounded-lg bg-card p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-semibold">{radar.cameraNumber}</h3>
      <p className="mb-1 text-sm text-gray-600">Location: {radar.location}</p>
      <p className="mb-1 text-sm text-gray-600">
        District: {radar.district ?? 'N/A'}
      </p>
      <p className="text-sm text-gray-600">Direction: {radar.direction}</p>
      <Button onClick={() => selectRadar(radar)}>Selecionar</Button>
    </div>
  )
}
