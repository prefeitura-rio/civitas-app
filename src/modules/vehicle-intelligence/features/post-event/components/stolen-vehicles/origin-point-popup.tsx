import { formatEventTime } from '@/modules/vehicle-intelligence/features/post-event/components/shared/event-time'
import type { OriginClusterPoint } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { PopupSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-section'
import { TEXT } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import { TemporalProfileSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/temporal-profile-section'
import type { OriginCluster } from '@/modules/vehicle-intelligence/features/post-event/types'
import { instantMs } from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

export function OriginPointPopup({
  point,
  modality,
}: {
  point: OriginClusterPoint
  modality: OriginCluster['modality']
}) {
  const recentEvents = [...point.events]
    .filter((event) => event.event_time)
    .sort(
      (left, right) =>
        (right.event_time ? instantMs(right.event_time) : 0) -
        (left.event_time ? instantMs(left.event_time) : 0),
    )
    .slice(0, 5)
  return (
    <div
      className={`cluster-popup origin-point-popup ${modality.toLocaleLowerCase('pt-BR')}`}
    >
      <span className="eyebrow">
        PONTO DO POLO DE {categoryLabel(modality).toUpperCase()}
      </span>
      <strong>{point.address}</strong>
      {point.events.some(
        (event) => event.classificacao === 'automatica_a_revisar',
      ) && <small>Categoria automática · revisão pendente</small>}
      {point.events.some(
        (event) => event.precisao_horario === 'hora_isp_sem_minuto',
      ) && <small>Há fatos com precisão de uma hora</small>}
      {point.events.some(
        (event) => event.horario_data_divergente === 'sim',
      ) && (
        <small>
          Há divergência de data entre fontes; mantida a data georreferenciada
        </small>
      )}
      <small>
        {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
      </small>
      <div className="cluster-popup-metrics">
        <span>
          <b>{formatNumber(point.occurrences)}</b> ocorrências neste ponto
        </span>
        <span>
          <b>{formatNumber(point.vehicles)}</b> {TEXT.vehicles}
        </span>
        <span>
          <b>{formatNumber(point.cispCount)}</b> CISPs informadas
        </span>
      </div>
      <TemporalProfileSection
        values={point.events.map((event) => event.event_time)}
      />
      <PopupSection
        title="Ocorrências recentes"
        hint="até 5 fatos"
        className="radar-popup-recent"
      >
        <div>
          {recentEvents.map((event) => (
            <time key={event.event_id}>
              {formatEventTime(event.event_time)} ·{' '}
              {event.cisp ? `CISP ${event.cisp}` : 'CISP não informada'}
            </time>
          ))}
        </div>
      </PopupSection>
    </div>
  )
}
