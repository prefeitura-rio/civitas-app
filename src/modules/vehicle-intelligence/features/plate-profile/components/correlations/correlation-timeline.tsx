import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  fetchOccurrenceDynamics,
  foldSearchText,
} from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import {
  CorrelationEventItem,
  type LinkedEvent,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-event'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileOccurrence } from '@/modules/vehicle-intelligence/types/domain'

/** Linha do tempo das correlações com busca textual nos relatos. */
export function CorrelationTimeline({
  occurrences,
  events,
  cispNames,
  citedNotes,
  plate,
  onOpenTimeline,
  onOpenOccurrence,
}: {
  occurrences: PlateProfileOccurrence[]
  events: LinkedEvent[]
  cispNames: Record<string, string>
  citedNotes: Map<string, string>
  plate: string
  onOpenTimeline: (day: string | null) => void
  onOpenOccurrence: (ro: string) => void
}) {
  const [query, setQuery] = useState('')
  const [dynamics, setDynamics] = useState<Map<string, string | null> | null>(
    null,
  )
  const [loadError, setLoadError] = useState(false)
  const eventKey = occurrences.map((item) => item.event_id).join('|')
  const linkedById = useMemo(
    () => new Map(events.map((event) => [event.event_id, event])),
    [events],
  )
  // Os relatos só são buscados quando alguém digita; trocar de placa ou recorte zera o cache.
  useEffect(() => {
    setDynamics(null)
    setLoadError(false)
  }, [eventKey])
  const wantsSearch = query.trim().length > 0
  useEffect(() => {
    if (!wantsSearch || dynamics || !eventKey) return
    const controller = new AbortController()
    fetchOccurrenceDynamics(eventKey.split('|'), controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted)
          setDynamics(
            new Map(rows.map((row) => [row.event_id, row.dynamics ?? null])),
          )
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true)
      })
    return () => controller.abort()
  }, [dynamics, eventKey, wantsSearch])
  const terms = useMemo(
    () => foldSearchText(query).split(/\s+/).filter(Boolean),
    [query],
  )
  const visible = useMemo(() => {
    if (!terms.length || !dynamics) return occurrences
    return occurrences.filter((item) => {
      const text = foldSearchText(dynamics.get(item.event_id) ?? '')
      return terms.every((term) => text.includes(term))
    })
  }, [dynamics, occurrences, terms])
  const searching = terms.length > 0 && !dynamics && !loadError
  return (
    <>
      {recorte.hasDynamics && (
        <div className="profile-corr-search">
          <label className="profile-corr-search-field">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar no relato dos fatos — ex.: pix, bradesco, capacete"
              aria-label="Buscar no relato dos fatos"
            />
            <span className="profile-corr-search-count" role="status">
              {searching
                ? 'carregando relatos…'
                : terms.length && dynamics
                  ? `${formatNumber(visible.length)} de ${formatNumber(occurrences.length)} ocorrências`
                  : pluralize(occurrences.length, 'ocorrência', 'ocorrências')}
            </span>
          </label>
          <small className="profile-corr-search-help">
            {loadError
              ? 'Não foi possível carregar os relatos.'
              : 'Ignora acentos e maiúsculas; com várias palavras, todas precisam aparecer no relato.'}
          </small>
        </div>
      )}
      <ol className="profile-corr-event-list">
        {visible.map((item) => {
          const index = occurrences.indexOf(item)
          return (
            <CorrelationEventItem
              key={item.event_id}
              item={item}
              index={index}
              linked={linkedById.get(item.event_id)}
              cispNames={cispNames}
              citedNote={citedNotes.get(item.event_id)}
              terms={dynamics ? terms : []}
              dynamics={dynamics?.get(item.event_id) ?? null}
              plate={plate}
              onOpenTimeline={onOpenTimeline}
              onOpenOccurrence={onOpenOccurrence}
            />
          )
        })}
        {terms.length > 0 && dynamics && visible.length === 0 && (
          <p className="profile-corr-empty">
            Nenhum relato desta placa contém “{query.trim()}”.
          </p>
        )}
      </ol>
    </>
  )
}
