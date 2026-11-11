import { BreakdownSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/breakdown-section'
import { ClusterConnections } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/cluster-connections'
import {
  percentageBreakdown,
  topCispItems,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { DisconnectionCategoryBreakdown } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/disconnection-category-breakdown'
import { formatPostEventDate } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/event-time'
import { PopupSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-section'
import type {
  ClusterConnection,
  DestinationCluster,
} from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function DestinationClusterPopup({
  cluster,
  cispLimit,
  connections,
}: {
  cluster: DestinationCluster
  cispLimit: number
  connections: ClusterConnection[]
}) {
  const cispBreakdown = percentageBreakdown(
    cluster.origins.map((origin) => origin.cisp),
  )
  const vehicleBreakdown = percentageBreakdown(
    cluster.origins.map((origin) => origin.target_category),
  )
  const connectedOccurrences = connections.reduce(
    (total, connection) => total + connection.occurrences,
    0,
  )
  const originsWithoutCoordinates = cluster.origins.filter(
    (origin) => origin.event_latitude == null || origin.event_longitude == null,
  ).length
  const geocodedOriginsOutsideClusters = Math.max(
    cluster.occurrences - connectedOccurrences - originsWithoutCoordinates,
    0,
  )
  const recentDetections = Array.from(
    new Set(
      cluster.origins
        .map((origin) => origin.destination_detected_at)
        .filter(Boolean),
    ),
  )
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())
    .slice(0, 4)
  return (
    <div className="cluster-popup destination-cluster-popup">
      <span className="eyebrow">POLO DE DESCONEXÃO</span>
      <strong>{cluster.name}</strong>
      <span>
        {formatNumber(cluster.occurrences)} ocorrências terminam nesta área
      </span>
      <small>
        Centro visual: {cluster.latitude.toFixed(6)},{' '}
        {cluster.longitude.toFixed(6)} · maior concentração da rua dominante (
        {formatNumber(cluster.street_incidence)} ocorrências)
      </small>
      <small>
        Extensão observada de {formatNumber(cluster.radius_meters)} m ·
        agrupamento formado pelos pontos finais observados
      </small>
      <div className="cluster-popup-metrics">
        <span>
          <b>{formatNumber(cluster.vehicles)}</b> veículos relacionados
        </span>
        <span>
          <b>{formatNumber(cluster.destination_points)}</b> pontos de coleta
        </span>
      </div>
      <DisconnectionCategoryBreakdown counts={cluster.category_counts} />
      <PopupSection
        title="Cobertura das conexões"
        hint="origem → polo"
        className="connection-coverage-section"
      >
        <div className="connection-coverage-grid">
          <span>
            <b>{connectedOccurrences}</b> de {cluster.occurrences} em polos de
            origem
          </span>
          <span>
            <b>{originsWithoutCoordinates}</b> sem coordenadas do fato
          </span>
          <span>
            <b>{geocodedOriginsOutsideClusters}</b> fora do DBSCAN de origem
          </span>
        </div>
        <small>
          Todos os casos continuam contando neste polo; somente origens
          pertencentes a um polo geram conexão no mapa.
        </small>
      </PopupSection>
      <BreakdownSection
        title="CISPs relacionadas"
        hint={`top ${Math.min(cispLimit, cispBreakdown.length)} de ${cispBreakdown.length}`}
        items={topCispItems(cispBreakdown, cispLimit)}
      />
      <BreakdownSection
        title="Tipos de veículo"
        hint="% dos finais neste polo"
        items={vehicleBreakdown}
      />
      <PopupSection
        title="Detecções mais recentes"
        hint="até 4 registros"
        className="radar-popup-recent"
      >
        <div>
          {recentDetections.map((detectedAt) => (
            <time key={detectedAt}>{formatPostEventDate(detectedAt)}</time>
          ))}
        </div>
      </PopupSection>
      <PopupSection
        title="Origens conectadas"
        hint={`${connections.length} ${connections.length === 1 ? 'polo' : 'polos'} · ${connectedOccurrences} ${connectedOccurrences === 1 ? 'ocorrência' : 'ocorrências'}`}
      >
        <ClusterConnections connections={connections} direction="destination" />
      </PopupSection>
    </div>
  )
}
