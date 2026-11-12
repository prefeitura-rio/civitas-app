import { CircleMarker, Popup, Tooltip } from 'react-leaflet'

import { OriginPointPopup } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/origin-point-popup'
import type { OriginPoint } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import {
  accessibleMarker,
  markerScale,
} from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { OriginPole } from '@/modules/vehicle-intelligence/features/post-event/types'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/** Os pontos (endereços) do polo de origem aberto; contorno claro onde passou placa citada. */
export function OriginPointMarkers({
  origin,
  points,
  maximum,
  expansion,
  onOpenPlate,
}: {
  origin: OriginPole
  points: OriginPoint[]
  maximum: number
  expansion: number
  onOpenPlate: (plate: string) => void
}) {
  return points.map((point) => {
    const robbery = origin.modality === 'ROUBO'
    const tracked = point.plates.length > 0
    return (
      <CircleMarker
        key={`point-${origin.id}-${point.key}`}
        center={[point.latitude, point.longitude]}
        radius={3.5 + 9 * markerScale(point.events.length, maximum)}
        pathOptions={{
          color: tracked ? '#fff7ed' : robbery ? '#7f1d2d' : '#7a4a0a',
          fillColor: robbery ? '#ff5f70' : '#f2a93b',
          weight: tracked ? 2.5 : 1,
          fillOpacity: (tracked ? 0.95 : 0.6) * expansion,
          opacity: expansion,
        }}
        className="pole-member"
        eventHandlers={accessibleMarker(
          `${point.address}, ${point.events.length} ocorrências`,
          (marker) => marker.openPopup(),
        )}
      >
        <Tooltip direction="top" offset={[0, -5]} opacity={0.96}>
          {point.address} ·{' '}
          {pluralize(point.events.length, 'ocorrência', 'ocorrências')}
          {tracked
            ? ` · ${pluralize(point.plates.length, 'placa citada', 'placas citadas')}`
            : ''}
        </Tooltip>
        <Popup minWidth={290} maxWidth={380} autoPanPadding={[24, 24]}>
          <OriginPointPopup
            point={point}
            modality={origin.modality}
            onOpenPlate={onOpenPlate}
          />
        </Popup>
      </CircleMarker>
    )
  })
}
