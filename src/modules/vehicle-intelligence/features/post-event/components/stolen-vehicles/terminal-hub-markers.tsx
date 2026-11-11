import { CircleMarker, Tooltip } from 'react-leaflet'

import {
  accessibleMarker,
  markerScale,
} from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import {
  categoryCountsLine,
  isRecurringConnection,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import type { PoleMarkerProps } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/pole-marker-props'
import type { LocationHotspot } from '@/modules/vehicle-intelligence/features/post-event/types'

/** Radares terminais: concentração recorrente de desconexões em poucos radares. */
export function TerminalHubMarkers({
  hubs,
  connections: allConnections,
  selectedId,
  hasSelection,
  relatedIds,
  poleMaximum,
  onOpen,
}: PoleMarkerProps<string> & { hubs: LocationHotspot[] }) {
  return hubs.map((point) => {
    const selected = point.point_id === selectedId
    const related = !hasSelection || selected || relatedIds.has(point.point_id)
    const connections = allConnections.filter(
      (connection) =>
        connection.destination_hub_id === point.point_id &&
        isRecurringConnection(connection),
    )
    return (
      <CircleMarker
        key={`disconnection-pole-${point.point_id}`}
        center={[point.latitude, point.longitude]}
        radius={
          selected ? 0.1 : 6 + 20 * markerScale(point.occurrences, poleMaximum)
        }
        pathOptions={{
          color: selected ? '#2e1641' : '#4c2c69',
          dashArray: '4 3',
          weight: selected ? 3 : 2,
          fillColor: '#9b63c1',
          fillOpacity: related ? (selected ? 1 : 0.78) : 0.1,
          opacity: related ? 1 : 0.1,
          className: 'disconnection-pole-marker concentrated',
        }}
        eventHandlers={{
          click: () => onOpen(point.point_id),
          ...accessibleMarker(
            `Polo de desconexão ${point.point_id}, ${point.location}, ${point.occurrences} últimas detecções`,
            () => onOpen(point.point_id),
          ),
        }}
      >
        <Tooltip direction="top" offset={[0, -5]} opacity={0.97}>
          <div>
            <strong>DESCONEXÃO · {point.location}</strong>
            <br />
            {point.occurrences} últimas detecções · {point.distinct_days} dias
            {categoryCountsLine(point.category_counts) && (
              <>
                <br />
                {categoryCountsLine(point.category_counts)}
              </>
            )}
            <br />
            <em>
              Concentração recorrente em poucos radares · {connections.length}{' '}
              polos de origem conectados
            </em>
          </div>
        </Tooltip>
      </CircleMarker>
    )
  })
}
