import { useEffect, useState } from 'react'

import { HighlightedText } from '@/modules/vehicle-intelligence/components/occurrence/highlighted-text'
import {
  type Dynamics,
  fetchOccurrenceDynamics,
} from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics-api'
import { TIME_ZONE } from '@/modules/vehicle-intelligence/lib/dates'

/** Consulta o relato apenas quando é montado; serve fora do mapa (tabelas). */
export function OccurrenceDynamicsPanel({
  eventIds,
  onSettled,
  highlight = [],
}: {
  eventIds: string[]
  onSettled?: () => void
  highlight?: string[]
}) {
  const key = JSON.stringify([...new Set(eventIds)].sort())
  const [data, setData] = useState<Dynamics[] | null>(null)
  const [error, setError] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError(false)
    fetchOccurrenceDynamics(JSON.parse(key) as string[], controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setData(rows)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
    return () => controller.abort()
  }, [key, revision])
  useEffect(() => {
    onSettled?.()
  }, [onSettled, data, error])
  return (
    <section className="occurrence-dynamics" aria-label="Dinâmica do fato">
      <h4>Dinâmica do fato</h4>
      {error ? (
        <p role="alert">
          Não foi possível carregar a dinâmica.{' '}
          <button
            type="button"
            onClick={() => setRevision((value) => value + 1)}
          >
            Tentar novamente
          </button>
        </p>
      ) : data === null ? (
        <p role="status">Carregando descrição…</p>
      ) : (
        <div
          className="occurrence-dynamics-text"
          tabIndex={0}
          aria-label="Descrição das ocorrências"
        >
          {data.map((row) => (
            <article key={row.event_id}>
              {data.length > 1 && (
                <header>
                  RO {row.event_id}
                  {row.event_time && (
                    <time>
                      {' '}
                      ·{' '}
                      {new Date(row.event_time).toLocaleString('pt-BR', {
                        timeZone: TIME_ZONE,
                      })}
                    </time>
                  )}
                </header>
              )}
              <p>
                {row.dynamics ? (
                  <HighlightedText text={row.dynamics} terms={highlight} />
                ) : (
                  'Dinâmica não informada na fonte.'
                )}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
