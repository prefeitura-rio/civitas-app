import { CircleMarker, Popup, Tooltip } from 'react-leaflet'

import {
  accessibleMarker,
  markerScale,
} from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { OriginClusterPoint } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { OriginPointPopup } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/origin-point-popup'
import { PRIMARY } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { OriginCluster } from '@/modules/vehicle-intelligence/features/post-event/types'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/** Os pontos (endereços) do polo de origem aberto, cada um com o seu popup. */
export function OriginPointMarkers({
  origin,
  points,
  maximum,
  expansion,
}: {
  origin: OriginCluster
  points: OriginClusterPoint[]
  maximum: number
  expansion: number
}) {
  return points.map((point) => {
    const robbery = origin.modality === PRIMARY
    return (
      <CircleMarker
        key={`origin-cluster-member-${origin.id}-${point.key}`}
        center={[point.latitude, point.longitude]}
        radius={4 + 10 * markerScale(point.occurrences, maximum)}
        pathOptions={{
          color: robbery ? '#7f1d2d' : '#7a4a0a',
          weight: 1.5,
          fillColor: robbery ? '#ff5f70' : '#f2a93b',
          fillOpacity: 0.92 * expansion,
          opacity: expansion,
          className: `origin-cluster-member ${robbery ? 'robbery' : 'theft'}`,
        }}
        eventHandlers={accessibleMarker(
          `${point.address}, ${pluralize(point.occurrences, 'ocorrência', 'ocorrências')}`,
          (marker) => marker.openPopup(),
        )}
      >
        <Tooltip direction="top" offset={[0, -5]} opacity={0.96}>
          {point.address} ·{' '}
          {pluralize(point.occurrences, 'ocorrência', 'ocorrências')}
        </Tooltip>
        <Popup minWidth={320} maxWidth={460}>
          <OriginPointPopup point={point} modality={origin.modality} />
        </Popup>
      </CircleMarker>
    )
  })
}
