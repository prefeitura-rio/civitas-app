import { BreakdownBars } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/breakdown-bars'
import { ConnectionList } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/connection-list'
import { DetailSection } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/detail-section'
import { LazyDynamics } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/lazy-dynamics'
import { PlateChips } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/plate-chips'
import {
  cispBreakdownLabel,
  modalityLabel,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import { TemporalProfile } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/temporal-profile'
import { formatEventTime } from '@/modules/vehicle-intelligence/features/post-event/components/shared/event-time'
import type {
  OriginPole,
  PoleConnection,
} from '@/modules/vehicle-intelligence/features/post-event/types'
import { toInstant } from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'

export function OriginPoleDetail({
  pole,
  connections,
  onOpenPlate,
  onSelect,
}: {
  pole: OriginPole
  connections: PoleConnection[]
  onOpenPlate: (plate: string) => void
  onSelect: (key: string) => void
}) {
  const tracked = pole.events.filter((event) => event.plates.length)
  const cited = [...new Set(pole.events.flatMap((event) => event.cited_plates))]
  const recent = [...pole.events]
    .filter((event) => event.event_time)
    .sort(
      (left, right) =>
        (toInstant(right.event_time)?.getTime() ?? 0) -
        (toInstant(left.event_time)?.getTime() ?? 0),
    )
    .slice(0, 4)
  return (
    <div className={`pole-detail origin ${pole.modality.toLowerCase()}`}>
      <span className="eyebrow">
        POLO DE {pole.modality} ·{' '}
        {pole.kind === 'concentration'
          ? 'CONCENTRAÇÃO'
          : 'AGRUPAMENTO ESPACIAL'}
      </span>
      <strong>{pole.name}</strong>
      <span>
        {pluralize(pole.occurrences, 'ocorrência', 'ocorrências')} de{' '}
        {modalityLabel(pole.modality)} nesta área
      </span>
      <small>
        Extensão de {formatNumber(pole.radius_meters)} m · centro na rua com
        mais fatos ({formatNumber(pole.street_incidence)})
      </small>
      <div className="detail-metrics">
        <span>
          <b>{formatNumber(pole.tracked_occurrences)}</b> com placa citada
          acompanhada
        </span>
        <span>
          <b>{formatNumber(pole.vehicles)}</b>{' '}
          {pole.vehicles === 1
            ? 'placa citada passou'
            : 'placas citadas passaram'}{' '}
          aqui
        </span>
        <span>
          <b>{formatNumber(pole.cisp_count)}</b> CISPs
        </span>
        <span>
          <b>{formatNumber(pole.distinct_days)}</b> dias com fato
        </span>
      </div>
      <DetailSection
        title="Placas citadas acompanhadas"
        hint="destaque: citada em RO deste polo"
      >
        <PlateChips
          plates={pole.plate_ids}
          onOpenPlate={onOpenPlate}
          highlight={cited}
        />
      </DetailSection>
      <DetailSection
        title="Polos de desconexão ligados"
        hint={pluralize(connections.length, 'ligação', 'ligações')}
      >
        <ConnectionList
          connections={connections}
          direction="origin"
          onSelect={onSelect}
        />
      </DetailSection>
      <DetailSection title="CISPs das ocorrências" hint="top 5">
        <BreakdownBars items={pole.cisp_breakdown} label={cispBreakdownLabel} />
      </DetailSection>
      <DetailSection title="Alvos">
        <BreakdownBars items={pole.target_breakdown} />
      </DetailSection>
      <TemporalProfile values={pole.events.map((event) => event.event_time)} />
      <DetailSection title="Ocorrências mais recentes">
        <div className="detail-times">
          {recent.map((event) => (
            <time key={event.event_id}>
              {formatEventTime(event.event_time)}
            </time>
          ))}
        </div>
      </DetailSection>
      <LazyDynamics
        eventIds={tracked.map((event) => event.event_id)}
        plates={pole.plate_ids}
      />
    </div>
  )
}
