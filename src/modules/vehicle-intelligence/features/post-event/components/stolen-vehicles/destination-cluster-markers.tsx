import { CircleMarker, Tooltip } from 'react-leaflet'

import { markerScale } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import {
  categoryCountsLine,
  isRecurringConnection,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import type { PoleMarkerProps } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/pole-marker-props'
import type { DestinationCluster } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function DestinationClusterMarkers({
  clusters,
  connections: allConnections,
  selectedId,
  hasSelection,
  relatedIds,
  poleMaximum,
  onOpen,
}: PoleMarkerProps<number> & { clusters: DestinationCluster[] }) {
  return clusters.map((cluster) => {
    const selected = cluster.id === selectedId
    const related = !hasSelection || selected || relatedIds.has(cluster.id)
    const connections = allConnections.filter(
      (connection) =>
        connection.destination_cluster_id === cluster.id &&
        isRecurringConnection(connection),
    )
    return (
      <CircleMarker
        key={`destination-cluster-${cluster.id}`}
        center={[cluster.latitude, cluster.longitude]}
        radius={
          selected
            ? 0.1
            : 6 + 20 * markerScale(cluster.occurrences, poleMaximum)
        }
        pathOptions={{
          color: '#4c2c69',
          weight: 2,
          fillColor: '#9b63c1',
          fillOpacity: selected ? 0 : related ? 0.72 : 0.14,
          opacity: selected ? 0 : related ? 1 : 0.12,
          className: 'destination-cluster-marker',
        }}
        eventHandlers={{ click: () => onOpen(cluster.id) }}
      >
        <Tooltip
          className="destination-cluster-tooltip"
          direction="top"
          offset={[0, -8]}
          opacity={0.98}
        >
          <div>
            <span>POLO DE DESCONEXÃO</span>
            <strong>{cluster.name}</strong>
            <small>
              {formatNumber(cluster.occurrences)} últimas detecções ·{' '}
              {cluster.destination_points} radares próximos ·{' '}
              {connections.length} polos de origem conectados
            </small>
            {categoryCountsLine(cluster.category_counts) && (
              <small>{categoryCountsLine(cluster.category_counts)}</small>
            )}
            <em>Clique para abrir os radares e as conexões agregadas</em>
          </div>
        </Tooltip>
      </CircleMarker>
    )
  })
}
