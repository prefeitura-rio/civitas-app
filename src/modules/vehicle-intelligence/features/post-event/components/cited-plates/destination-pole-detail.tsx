import { BreakdownBars } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/breakdown-bars'
import { ConnectionList } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/connection-list'
import { DetailSection } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/detail-section'
import { LazyDynamics } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/lazy-dynamics'
import { PlateChips } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/plate-chips'
import { cispBreakdownLabel } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import { formatEventTime } from '@/modules/vehicle-intelligence/features/post-event/components/shared/event-time'
import type {
  DestinationPole,
  PoleConnection,
} from '@/modules/vehicle-intelligence/features/post-event/types'
import {
  formatElapsedHours,
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'

export function DestinationPoleDetail({
  pole,
  connections,
  onOpenPlate,
  onSelect,
}: {
  pole: DestinationPole
  connections: PoleConnection[]
  onOpenPlate: (plate: string) => void
  onSelect: (key: string) => void
}) {
  const connected = connections.reduce(
    (total, connection) => total + connection.occurrences,
    0,
  )
  return (
    <div className="pole-detail destination">
      <span className="eyebrow">
        POLO DE DESCONEXÃO ·{' '}
        {pole.kind === 'concentration'
          ? 'CONCENTRAÇÃO EM UM RADAR'
          : 'VÁRIOS RADARES'}
      </span>
      <strong>{pole.name}</strong>
      <span>
        {pluralize(
          pole.occurrences,
          'ocorrência termina',
          'ocorrências terminam',
        )}{' '}
        aqui
      </span>
      <small>
        {pluralize(pole.radar_count, 'radar', 'radares')} · extensão de{' '}
        {formatNumber(pole.radius_meters)} m · última leitura antes de um hiato
        &gt;8h
      </small>
      <div className="detail-metrics">
        <span>
          <b>{formatNumber(pole.vehicles)}</b> placas citadas
        </span>
        <span>
          <b>{formatNumber(pole.distinct_days)}</b> dias distintos
        </span>
        <span>
          <b>{formatElapsedHours(pole.median_elapsed_hours, 1)}</b> mediana do
          fato à desconexão
        </span>
        <span>
          <b>{formatNumber(connected)}</b> de {formatNumber(pole.occurrences)}{' '}
          vindas de polos de origem
        </span>
      </div>
      <DetailSection title="Placas que desconectam aqui">
        <PlateChips plates={pole.plate_ids} onOpenPlate={onOpenPlate} />
      </DetailSection>
      <DetailSection
        title="Polos de roubo e furto ligados"
        hint={pluralize(connections.length, 'ligação', 'ligações')}
      >
        <ConnectionList
          connections={connections}
          direction="destination"
          onSelect={onSelect}
        />
      </DetailSection>
      <DetailSection
        title="Radares do polo"
        hint="clique no mapa para detalhes"
      >
        <div className="radar-list">
          {pole.radars.map((radar) => (
            <div key={radar.point_id}>
              <span>
                {radar.location || 'Local não informado'}
                <small>
                  {radar.point_id}
                  {radar.direction ? ` · sentido ${radar.direction}` : ''}
                </small>
              </span>
              <b>{formatNumber(radar.occurrences)}</b>
            </div>
          ))}
        </div>
      </DetailSection>
      <DetailSection title="Modalidade das ocorrências">
        <BreakdownBars items={pole.modality_breakdown} />
      </DetailSection>
      <DetailSection title="CISPs de origem" hint="top 5">
        <BreakdownBars items={pole.cisp_breakdown} label={cispBreakdownLabel} />
      </DetailSection>
      <DetailSection title="Últimas leituras antes do hiato">
        <div className="detail-times">
          {pole.recent_detection_times.map((value) => (
            <time key={value}>{formatEventTime(value)}</time>
          ))}
        </div>
      </DetailSection>
      <LazyDynamics eventIds={pole.event_ids} plates={pole.plate_ids} />
    </div>
  )
}
