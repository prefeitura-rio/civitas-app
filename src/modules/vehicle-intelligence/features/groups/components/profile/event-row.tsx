import { useState } from 'react'

import { eventPairs } from '@/modules/vehicle-intelligence/features/groups/components/profile/event-pairs'
import { Narrative } from '@/modules/vehicle-intelligence/features/groups/components/profile/narrative'
import {
  formatDayMonthYear,
  formatTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  categoryLabel,
  cispLabel,
  shortAddress,
  titleCaseText,
} from '@/modules/vehicle-intelligence/lib/labels'
import type { GroupEvent } from '@/modules/vehicle-intelligence/types/groups'

/** Uma ocorrência: data (abre o dia na timeline), local, alvo, placas, evidência e o relato sob demanda. */
export function EventRow({
  groupEvent,
  colors,
  plates,
  onOpenDay,
}: {
  groupEvent: GroupEvent
  colors: Record<string, string>
  plates: string[]
  onOpenDay: (day: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const pairs = eventPairs(groupEvent)
  return (
    <div role="row" className="group-table-row grupo-evento">
      <span role="cell">
        <button
          type="button"
          className="group-data-timeline"
          title="Abrir este dia na timeline do grupo"
          onClick={() => onOpenDay(groupEvent.day)}
        >
          <span className="light">
            {formatDayMonthYear(groupEvent.occurred_at)}
          </span>{' '}
          <span className="dim">{formatTime(groupEvent.occurred_at)}</span>
        </button>
        <small className="nowrap">
          RO {groupEvent.ro ?? groupEvent.event_id}
        </small>
      </span>
      <span role="cell">
        {shortAddress(groupEvent.address)}
        <small>{cispLabel(groupEvent.cisp, groupEvent.cisp_name)}</small>
      </span>
      <span role="cell">
        {categoryLabel(groupEvent.category ?? '')}
        <small>
          {[
            groupEvent.modality ? titleCaseText(groupEvent.modality) : null,
            groupEvent.offender_mode
              ? `autor em ${groupEvent.offender_mode.toLocaleLowerCase('pt-BR')}`
              : null,
          ]
            .filter(Boolean)
            .join(', ')}
        </small>
      </span>
      <span role="cell" className="group-event-plates">
        {groupEvent.plates.map((p) => (
          <span key={p} className="group-plate">
            <i style={{ background: colors[p] }} aria-hidden="true" />
            {p}
          </span>
        ))}
      </span>
      <span role="cell" className="group-event-pairs">
        {pairs.length ? (
          pairs.map((pair) => (
            <span key={pair.pair}>
              <span className="group-plate small">{pair.pair}</span>{' '}
              <span>{pair.text}</span>
            </span>
          ))
        ) : (
          <span className="dim">Uma placa só</span>
        )}
      </span>
      <span role="cell" className="end">
        <button
          type="button"
          className="group-link"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Fechar' : 'Ver relato'}
        </button>
      </span>
      {expanded && <Narrative eventId={groupEvent.event_id} plates={plates} />}
    </div>
  )
}
