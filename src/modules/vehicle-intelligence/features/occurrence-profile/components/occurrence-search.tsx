import '@/modules/vehicle-intelligence/components/groups/groups.css'
import '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-profile.css'

import { Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { occurrenceSearchPath } from '@/modules/vehicle-intelligence/features/occurrence-profile/api'
import { OccurrenceResults } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-results'
import type { OccurrenceSearchData } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** A busca do perfil do RO: pelo número (inteiro ou trecho) ou pela placa vítima. */
export function OccurrenceSearch({
  active,
  onOpen,
}: {
  active: boolean
  onOpen: (ro: string) => void
}) {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const search = useApi<OccurrenceSearchData>(
    active && query.length >= 3 ? occurrenceSearchPath(query) : null,
    {
      fallbackError: 'Falha na busca de ROs',
    },
  )
  const data =
    search.dataPath === occurrenceSearchPath(query) ? search.data : null
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setQuery(text.trim())
  }
  const placeholder =
    recorte.strategy === 'copassagem'
      ? '019-06778/2026 ou ABC1D23'
      : '010-00114/2026'
  return (
    <div className="groups-page occurrence-page">
      <section className="groups-panel">
        <div className="panel-head">
          <div>
            <h2>Abrir o perfil de um RO</h2>
            <p>
              Digite o número do RO (inteiro ou um trecho)
              {recorte.strategy === 'copassagem' ? ' ou a placa vítima' : ''}. O
              perfil mostra o local, as placas que passaram{' '}
              {recorte.strategy === 'copassagem' ? 'junto da vítima e ' : ''}
              perto do local, e destaca as suspeitas: citadas no relato, no
              Cerco ou com suspeita de clone.
            </p>
          </div>
        </div>
        <form
          className="occurrence-search-form"
          onSubmit={submit}
          role="search"
        >
          <label className="occurrence-search-field large">
            <Search size={16} aria-hidden="true" />
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={placeholder}
              aria-label="RO ou placa vítima"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <Button type="submit" disabled={text.trim().length < 3}>
            Buscar
          </Button>
        </form>
        {search.error && <ErrorBanner message={search.error} />}
        {query && !data && !search.error && (
          <p role="status" className="list-empty">
            Buscando…
          </p>
        )}
        {data &&
          (data.results.length ? (
            <>
              <OccurrenceResults results={data.results} onOpen={onOpen} />
              <div className="list-footer">
                <span>
                  {formatNumber(data.results.length)}{' '}
                  {data.results.length === 1 ? 'RO' : 'ROs'}
                  {data.truncated
                    ? ' (os mais recentes; refine a busca para ver outros)'
                    : ''}
                </span>
              </div>
            </>
          ) : (
            <p className="list-empty">
              Nenhum RO do município do Rio neste recorte com “{data.query}”.
              ROs de outros municípios e os que não entraram na base do painel
              não têm perfil.
            </p>
          ))}
      </section>
    </div>
  )
}
