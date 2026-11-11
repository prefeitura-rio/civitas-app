import type { Dispatch, SetStateAction } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import {
  ChoicePill,
  CispPill,
  FilterBar,
  FilterToggle,
  MultiPill,
  PeriodPill,
} from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { postEventPath } from '@/modules/vehicle-intelligence/features/post-event/api'
import { DataTables } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/data-tables'
import {
  type CitedFilters,
  citedParams,
  DEFAULT_CITED_FILTERS,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/filters'
import { PoleExplorer } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/pole-explorer'
import type { PostEventData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import { DEFAULT_EVENT_SCOPE } from '@/modules/vehicle-intelligence/stores/event-scope'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

export function CitedPlatesContent({
  active,
  onOpenPlate,
  options,
  filters,
  onFiltersChange: setFilters,
  onRetry,
}: {
  active: boolean
  onOpenPlate: (plate: string) => void
  options: MasterGraphOptions | null
  filters: CitedFilters
  onFiltersChange: Dispatch<SetStateAction<CitedFilters>>
  onRetry: () => void
}) {
  const query = citedParams(filters, options?.fact_period)
  const { data, error, loading } = useApi<PostEventData>(
    active ? postEventPath(query) : null,
    {
      delayMs: 180,
    },
  )
  const recurrent = data?.ready
    ? data.pole_connections.filter((connection) => connection.recurrent).length
    : 0
  const modalities = options?.modalidades ?? DEFAULT_EVENT_SCOPE.modalidades
  const updateFilters = (patch: Partial<CitedFilters>) =>
    setFilters((current) => ({ ...current, ...patch }))
  const dirty =
    filters.period.preset !== 'all' ||
    filters.modalidades.length > 0 ||
    filters.alvos.length > 0 ||
    filters.deslocamentos.length > 0 ||
    filters.cisps.length > 0 ||
    filters.onlyTracked
  return (
    <div className="module-stack post-event-view">
      <section className="module-hero">
        <div>
          <span className="eyebrow">PÓS-FATO · PLACAS CITADAS NA DINÂMICA</span>
          <h2>Para onde vão as placas citadas depois dos fatos</h2>
          <p>
            Cada placa citada em um RO é acompanhada a partir dessa ocorrência e
            de todas em que aparece como correlata. A desconexão é o último
            local lido antes do primeiro hiato superior a{' '}
            {data?.ready ? data.methodology.hiatus_hours : 8} horas.
          </p>
        </div>
      </section>
      {options && (
        <FilterBar
          dirty={dirty}
          onClear={() => setFilters(DEFAULT_CITED_FILTERS)}
          extras={
            <FilterToggle
              label="Só polos com placa citada"
              checked={filters.onlyTracked}
              onChange={(onlyTracked) => updateFilters({ onlyTracked })}
            />
          }
        >
          <PeriodPill
            value={filters.period}
            factPeriod={options.fact_period}
            onChange={(period) => updateFilters({ period })}
          />
          <ChoicePill
            label="Tipo do fato"
            value={
              filters.modalidades.length === 1
                ? filters.modalidades[0]
                : 'TODOS'
            }
            items={[
              { value: 'TODOS', label: 'Todos' },
              ...modalities.map((value) => ({
                value,
                label: categoryLabel(value),
              })),
            ]}
            onChange={(value) =>
              updateFilters({ modalidades: value === 'TODOS' ? [] : [value] })
            }
          />
          <MultiPill
            label="Alvo"
            options={(options.alvos ?? []).map((value) => ({ value }))}
            selected={filters.alvos}
            onChange={(alvos) => updateFilters({ alvos })}
          />
          {(options.deslocamentos ?? []).some(Boolean) && (
            <MultiPill
              label="Autor"
              allLabel="Qualquer"
              options={(options.deslocamentos ?? [])
                .filter(Boolean)
                .map((value) => ({ value }))}
              selected={filters.deslocamentos}
              onChange={(deslocamentos) => updateFilters({ deslocamentos })}
            />
          )}
          <CispPill
            options={(options.cisps ?? []).map((codigo) => ({
              codigo,
              nome: options.cisp_names?.[codigo] || `CISP ${codigo}`,
              total: 0,
            }))}
            selected={filters.cisps}
            onChange={(cisps) => updateFilters({ cisps })}
          />
        </FilterBar>
      )}
      {error && <ErrorBanner message={error} onRetry={onRetry} />}
      {data && loading && (
        <p role="status" className="post-loading">
          Aplicando recorte…
        </p>
      )}
      {!data && !error && (
        <p role="status" className="post-loading">
          Calculando os polos das placas citadas…
        </p>
      )}
      {data && !data.ready && (
        <p role="status">
          {data.reason || 'Dados indisponíveis neste snapshot.'}
        </p>
      )}
      {data?.ready &&
        (data.summary.plates === 0 ? (
          <section className="panel post-empty">
            Nenhuma placa citada {dirty ? 'neste recorte' : 'nesta base'}.
          </section>
        ) : (
          <>
            <div className="post-ruler five">
              <article>
                <span>Placas citadas</span>
                <strong>{formatNumber(data.summary.plates)}</strong>
                <small>acompanhadas</small>
              </article>
              <article>
                <span>Ocorrências</span>
                <strong>{formatNumber(data.summary.events)}</strong>
                <small>acompanhadas</small>
              </article>
              <article>
                <span>
                  <i className="marker origin" />
                  Polos de origem
                </span>
                <strong>{formatNumber(data.origin_poles.length)}</strong>
                <small>
                  {formatNumber(
                    data.origin_poles.filter(
                      (pole) => pole.tracked_occurrences > 0,
                    ).length,
                  )}{' '}
                  com placa citada
                </small>
              </article>
              <article>
                <span>
                  <i className="marker destination" />
                  Polos de desconexão
                </span>
                <strong>{formatNumber(data.destination_poles.length)}</strong>
                <small>
                  {formatNumber(data.summary.disconnect_pairs)} desconexões
                </small>
              </article>
              <article>
                <span>
                  <i className="marker flow" />
                  Conexões recorrentes
                </span>
                <strong>{formatNumber(recurrent)}</strong>
                <small>
                  {data.methodology.recurrent_connection_minimum_events} ou mais
                  ocorrências
                </small>
              </article>
            </div>
            <PoleExplorer
              data={data}
              active={active}
              onlyTracked={filters.onlyTracked}
              onOpenPlate={onOpenPlate}
            />
            <DataTables data={data} onOpenPlate={onOpenPlate} />
            <details className="panel post-method">
              <summary>Critérios e denominadores</summary>
              <p>{data.methodology.ranking_rule}</p>
              <p>{data.methodology.origin_rule}</p>
              <p>
                {data.methodology.destination_rule}{' '}
                {data.methodology.cluster_rule}
              </p>
              <p>{data.methodology.connection_rule}</p>
              <p>{data.methodology.circulation_rule}</p>
              <p>
                <strong>{data.methodology.warning}</strong>
              </p>
            </details>
          </>
        ))}
    </div>
  )
}
