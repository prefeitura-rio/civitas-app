import { useState } from 'react'

import { OccurrenceDynamicsPanel } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import {
  citationExplanation,
  citationVerdicts,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/citations'
import { correlationEventAnchor } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-format'
import {
  formatCivilDay,
  formatTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import { titleCase } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  PlateCitation,
  PlateCitationsData,
} from '@/modules/vehicle-intelligence/types/domain'

/** O relato só é buscado quando alguém abre a seção. */
function CitationDynamics({
  eventId,
  plate,
}: {
  eventId: string
  plate: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <details
      className="profile-citation-dynamics"
      onToggle={(event) =>
        setOpen((event.currentTarget as HTMLDetailsElement).open)
      }
    >
      <summary>Ler o relato</summary>
      {open && (
        <OccurrenceDynamicsPanel
          eventIds={[eventId]}
          highlight={[plate.toLowerCase()]}
        />
      )}
    </details>
  )
}

/**
 * ROs que citam a placa: resumo neutro, uma linha por RO, com o motivo de a placa não estar correlacionada ao fato.
 * `itens`: só os que não estão na linha do tempo (a placa citada sempre tem o RO no perfil, com ou sem correlação).
 */
export function CitationSummary({
  plate,
  data,
  items,
}: {
  plate: string
  data: PlateCitationsData | null
  items?: PlateCitation[]
}) {
  if (!data?.ready) return null
  const list = items ?? data.citations
  if (!list.length) return null
  const {
    event_window_minutes: windowMinutes,
    radius_meters: radius,
    period_start: periodStart,
  } = data.methodology
  const roCount = pluralize(list.length, 'RO', 'ROs')
  return (
    <section
      className="profile-citation-summary"
      aria-label="ROs que citam a placa"
    >
      <header>
        <strong>
          {items
            ? `Citada no relato de ${roCount} fora da linha do tempo`
            : `Citada na dinâmica de ${roCount}`}
        </strong>
        <span>
          {items
            ? `A placa não aparece correlacionada a ${list.length === 1 ? 'este fato' : 'estes fatos'} com ±${windowMinutes} min e ${formatNumber(radius)} m e os filtros do recorte.`
            : `Correlação conferida com ±${windowMinutes} min e ${formatNumber(radius)} m.`}{' '}
          A citação não comprova autoria.
        </span>
      </header>
      <ul>
        {list.map((item) => (
          <li key={item.event_id} id={correlationEventAnchor(item.event_id)}>
            <div className="profile-citation-line">
              <strong>{item.event_id}</strong>
              <span>
                {formatCivilDay(item.event_date, 'data não informada')}
                {item.event_time
                  ? ` · ${formatTime(item.event_time)}`
                  : item.approximate_hour
                    ? ` · hora informada ${formatTime(item.approximate_hour.start)}–${formatTime(item.approximate_hour.end)}`
                    : ' · sem horário'}
              </span>
              <span title={item.address || ''}>
                {[
                  item.modality ? titleCase(item.modality.toLowerCase()) : null,
                  item.address,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              {item.before_period && periodStart && (
                <span>antes do período escolhido</span>
              )}
            </div>
            <p>
              <b>{citationVerdicts[item.status].title}.</b>{' '}
              {citationExplanation(item, windowMinutes, radius)}
            </p>
            <CitationDynamics eventId={item.event_id} plate={plate} />
          </li>
        ))}
      </ul>
    </section>
  )
}
