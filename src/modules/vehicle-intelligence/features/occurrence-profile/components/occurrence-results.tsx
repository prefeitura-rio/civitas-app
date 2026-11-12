import { ArrowRight } from 'lucide-react'

import type { OccurrenceSearchResult } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'
import {
  categoryLabel,
  cispLabel,
} from '@/modules/vehicle-intelligence/lib/labels'

/** Os ROs encontrados (pelo número ou pela placa vítima): clique para abrir o perfil. */
export function OccurrenceResults({
  results,
  onOpen,
}: {
  results: OccurrenceSearchResult[]
  onOpen: (ro: string) => void
}) {
  return (
    <div
      className="list occurrence-list occurrence-list-results"
      role="table"
      aria-label="ROs encontrados"
    >
      <div className="list-head" role="row">
        <span role="columnheader">RO</span>
        <span role="columnheader">Quando</span>
        <span role="columnheader">Onde</span>
        <span role="columnheader">Placa vítima</span>
        <span role="columnheader" aria-label="Abrir" />
      </div>
      {results.map((item, index) => (
        <div
          key={item.ro}
          role="row"
          className={`list-row${index % 2 ? ' pair' : ''}`}
        >
          <span role="cell">
            <button
              type="button"
              className="group-plate underlined list-plate"
              onClick={() => onOpen(item.ro)}
            >
              {item.ro}
            </button>
            {item.modality && <small>{categoryLabel(item.modality)}</small>}
          </span>
          <span role="cell" className="num-text">
            {formatDateTime(item.event_time, 'não informado')}
          </span>
          <span role="cell">
            <span>{item.address ?? 'local não informado'}</span>
            <small>{cispLabel(item.cisp, item.cisp_name)}</small>
          </span>
          <span role="cell">
            <span className="light">
              {item.victim_plates.join(', ') || '—'}
            </span>
          </span>
          <span role="cell">
            <button
              type="button"
              className="occurrence-open"
              onClick={() => onOpen(item.ro)}
              aria-label={`Abrir o perfil do RO ${item.ro}`}
            >
              <ArrowRight size={15} />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}
