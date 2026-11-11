import { Fragment } from 'react'
import { CircleMarker, Popup } from 'react-leaflet'

import { markerScale } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import { RadarPopup } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/radar-popup'
import type { DestinationCluster } from '@/modules/vehicle-intelligence/features/post-event/types'

/** Os radares do polo de desconexão aberto, cada um com o seu popup. */
export function DestinationMemberMarkers({
  cluster,
  maximum,
  expansion,
  cispLimit,
}: {
  cluster: DestinationCluster
  maximum: number
  expansion: number
  cispLimit: number
}) {
  return (
    <Fragment>
      {cluster.destinations.map((member) => (
        <CircleMarker
          key={`cluster-member-${cluster.id}-${member.point_id}`}
          center={[member.latitude, member.longitude]}
          radius={5 + 12 * markerScale(member.occurrences, maximum)}
          pathOptions={{
            color: '#0c4a55',
            weight: 1.5,
            fillColor: '#18c7dd',
            fillOpacity: 0.82 * expansion,
            opacity: expansion,
            className: 'destination-cluster-member',
          }}
        >
          <Popup minWidth={320} maxWidth={430}>
            <RadarPopup radar={member} cispLimit={cispLimit} />
          </Popup>
        </CircleMarker>
      ))}
    </Fragment>
  )
}
