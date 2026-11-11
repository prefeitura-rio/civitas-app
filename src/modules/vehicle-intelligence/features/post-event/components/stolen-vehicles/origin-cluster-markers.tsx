import { CircleMarker, Tooltip } from 'react-leaflet'

import { markerScale } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import { isRecurringConnection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import type { PoleMarkerProps } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/pole-marker-props'
import { PRIMARY } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { OriginCluster } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

export function OriginClusterMarkers({
  clusters,
  connections: allConnections,
  selectedId,
  hasSelection,
  relatedIds,
  poleMaximum,
  onOpen,
}: PoleMarkerProps<string> & { clusters: OriginCluster[] }) {
  return clusters.map((cluster) => {
    const selected = cluster.id === selectedId
    const related = !hasSelection || selected || relatedIds.has(cluster.id)
    const connections = allConnections.filter(
      (connection) =>
        connection.origin_cluster_id === cluster.id &&
        isRecurringConnection(connection),
    )
    const robbery = cluster.modality === PRIMARY
    return (
      <CircleMarker
        key={`origin-cluster-${cluster.id}`}
        center={[cluster.latitude, cluster.longitude]}
        radius={
          selected
            ? 0.1
            : 6 + 20 * markerScale(cluster.occurrences, poleMaximum)
        }
        pathOptions={{
          color: robbery ? '#8f2934' : '#7a551a',
          dashArray: cluster.kind === 'concentration' ? '4 3' : undefined,
          weight: 2,
          fillColor: robbery ? '#e45765' : '#d99a2b',
          fillOpacity: selected ? 0 : related ? 0.76 : 0.14,
          opacity: selected ? 0 : related ? 1 : 0.12,
          className: `origin-cluster-marker ${robbery ? 'robbery' : 'theft'} ${cluster.kind}`,
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
            <span>
              POLO DE {categoryLabel(cluster.modality).toUpperCase()} ·{' '}
              {cluster.kind === 'concentration'
                ? 'CONCENTRAÇÃO'
                : 'AGRUPAMENTO ESPACIAL'}
            </span>
            <strong>{cluster.name}</strong>
            <small>
              {formatNumber(cluster.occurrences)} ocorrências ·{' '}
              {connections.length} polos de desconexão conectados
            </small>
            <em>Clique para abrir os pontos e as conexões agregadas</em>
          </div>
        </Tooltip>
      </CircleMarker>
    )
  })
}
