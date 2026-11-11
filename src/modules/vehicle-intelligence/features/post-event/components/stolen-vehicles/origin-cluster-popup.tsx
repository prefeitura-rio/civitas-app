import { BreakdownSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/breakdown-section'
import { ClusterConnections } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/cluster-connections'
import {
  percentageBreakdown,
  topCispItems,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { formatPostEventDate } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/event-time'
import { PopupSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-section'
import { TEXT } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import { TemporalProfileSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/temporal-profile-section'
import type {
  ClusterConnection,
  OriginCluster,
} from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

export function OriginClusterPopup({
  cluster,
  cispLimit,
  connections,
}: {
  cluster: OriginCluster
  cispLimit: number
  connections: ClusterConnection[]
}) {
  const cispBreakdown = percentageBreakdown(
    cluster.events.map((event) => event.cisp),
  )
  const vehicleBreakdown = percentageBreakdown(
    cluster.events.map((event) => event.target_category),
  )
  const recentEvents = Array.from(
    new Set(
      cluster.events
        .map((event) => event.event_time)
        .filter((value): value is string => Boolean(value)),
    ),
  )
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())
    .slice(0, 4)
  return (
    <div
      className={`cluster-popup origin-cluster-popup ${cluster.modality.toLocaleLowerCase('pt-BR')}`}
    >
      <span className="eyebrow">
        POLO DE {categoryLabel(cluster.modality).toUpperCase()} ·{' '}
        {cluster.kind === 'concentration'
          ? 'CONCENTRAÇÃO'
          : 'AGRUPAMENTO ESPACIAL'}
      </span>
      <strong>{cluster.name}</strong>
      <span>
        {formatNumber(cluster.occurrences)} ocorrências de origem nesta área
      </span>
      <small>
        Centro visual: {cluster.latitude.toFixed(6)},{' '}
        {cluster.longitude.toFixed(6)} · maior concentração da rua dominante (
        {formatNumber(cluster.street_incidence)} ocorrências)
      </small>
      <small>
        Extensão observada de {formatNumber(cluster.radius_meters)} m · conexão
        calculada pelo mesmo identificador da ocorrência
      </small>
      <div className="cluster-popup-metrics">
        <span>
          <b>{formatNumber(cluster.vehicles)}</b> {TEXT.vehicles}
        </span>
        <span>
          <b>{formatNumber(cluster.cisp_count)}</b> CISPs distintas
        </span>
      </div>
      <BreakdownSection
        title="CISPs das ocorrências"
        hint={`top ${Math.min(cispLimit, cispBreakdown.length)} de ${cispBreakdown.length}`}
        items={topCispItems(cispBreakdown, cispLimit)}
      />
      <BreakdownSection
        title="Tipos de veículo"
        hint="% das ocorrências"
        items={vehicleBreakdown}
      />
      <TemporalProfileSection
        values={cluster.events.map((event) => event.event_time)}
      />
      <PopupSection
        title="Ocorrências mais recentes"
        hint="horário do fato"
        className="radar-popup-recent"
      >
        <div>
          {recentEvents.map((eventTime) => (
            <time key={eventTime}>{formatPostEventDate(eventTime)}</time>
          ))}
        </div>
      </PopupSection>
      <PopupSection
        title="Polos de desconexão conectados"
        hint={`${connections.length} ${connections.length === 1 ? 'ligação' : 'ligações'}`}
      >
        <ClusterConnections connections={connections} direction="origin" />
      </PopupSection>
    </div>
  )
}
