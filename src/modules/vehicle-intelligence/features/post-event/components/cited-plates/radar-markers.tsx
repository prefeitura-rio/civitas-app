import { CircleMarker, Popup, Tooltip } from 'react-leaflet'

import { RadarPopup } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/radar-popup'
import {
  accessibleMarker,
  markerScale,
} from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { DestinationPole } from '@/modules/vehicle-intelligence/features/post-event/types'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/** Os radares do polo de desconexão aberto, cada um com o seu popup. */
export function RadarMarkers({
  destination,
  maximum,
  expansion,
  onOpenPlate,
}: {
  destination: DestinationPole
  maximum: number
  expansion: number
  onOpenPlate: (plate: string) => void
}) {
  return destination.radars.map((radar) => (
    <CircleMarker
      key={`radar-${destination.id}-${radar.point_id}`}
      center={[radar.latitude, radar.longitude]}
      radius={5 + 12 * markerScale(radar.occurrences, maximum)}
      pathOptions={{
        color: '#0c4a55',
        fillColor: '#18c7dd',
        weight: 1.5,
        fillOpacity: 0.85 * expansion,
        opacity: expansion,
      }}
      className="pole-member"
      eventHandlers={accessibleMarker(
        `${radar.location ?? radar.point_id}, ${radar.occurrences} desconexões`,
        (marker) => marker.openPopup(),
      )}
    >
      <Tooltip direction="top" offset={[0, -5]} opacity={0.96}>
        {radar.location ?? radar.point_id} ·{' '}
        {pluralize(radar.occurrences, 'desconexão', 'desconexões')}
      </Tooltip>
      <Popup minWidth={290} maxWidth={360} autoPanPadding={[24, 24]}>
        <RadarPopup radar={radar} onOpenPlate={onOpenPlate} />
      </Popup>
    </CircleMarker>
  ))
}
