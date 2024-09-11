import React from 'react'

import type { Radar } from '@/models/entities'

export default function HoverCard(props: Radar) {
  return (
    <div className="w-96 rounded-lg bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-semibold">{props.cameraNumber}</h3>
      <p className="mb-1 text-sm text-gray-600">Location: {props.location}</p>
      <p className="mb-1 text-sm text-gray-600">
        District: {props.district ?? 'N/A'}
      </p>
      <p className="text-sm text-gray-600">Direction: {props.direction}</p>
    </div>
  )
}
