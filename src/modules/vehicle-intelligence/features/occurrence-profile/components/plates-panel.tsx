import { Search } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'

import { Segments } from '@/modules/vehicle-intelligence/components/groups/controls'
import {
  type PlatesKind,
  PlatesTable,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plates-table'
import {
  hasSignal,
  type PlateSort,
  SORT_LABELS,
  sortRows,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type { OccurrencePlateList } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

type Filter = 'all' | 'signal'

const plural = (count: number, one: string, many: string) =>
  `${formatNumber(count)} ${count === 1 ? one : many}`

/** Quantas placas da lista têm cada sinal ("1 citada no relato · 1 no Cerco · 2 no Disque Denúncia · 29 suspeitas de clone"). */
function signalCounts(
  list: Extract<OccurrencePlateList, { available: true }>,
): string {
  return [
    list.cited && plural(list.cited, 'citada no relato', 'citadas no relato'),
    list.compatible &&
      plural(
        list.compatible,
        'compatível com trecho citado',
        'compatíveis com trecho citado',
      ),
    list.cerco && `${formatNumber(list.cerco)} no Cerco`,
    list.reported && `${formatNumber(list.reported)} no Disque Denúncia`,
    list.clones &&
      plural(list.clones, 'suspeita de clone', 'suspeitas de clone'),
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Uma das listas do perfil (junto da vítima ou perto do local): janelas, filtro, busca, tabela e rodapé. Dentro das
 * abas, o título é a aba (`heading` nulo). */
export function PlatesPanel({
  kind,
  ro,
  eventTime,
  list,
  loading,
  title,
  heading = true,
  description,
  note,
  emptyText,
  controls,
  onOpenPlate,
}: {
  kind: PlatesKind
  ro: string
  eventTime: string | null
  list: OccurrencePlateList | null
  loading: boolean
  title: string
  heading?: boolean
  description: string
  /** Uma linha a mais junto dos seletores (por que o raio e a janela são esses). */
  note?: string
  emptyText: string
  controls: ReactNode
  onOpenPlate: (plate: string) => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<PlateSort>('signal')
  const [search, setSearch] = useState('')
  const rows = useMemo(() => (list?.available ? list.rows : []), [list])
  const term = search.trim().toUpperCase()
  const visible = useMemo(
    () =>
      sortRows(
        rows.filter(
          (row) =>
            (filter === 'all' || hasSignal(row)) &&
            (!term || row.plate.includes(term)),
        ),
        sort,
        ro,
      ),
    [rows, filter, term, sort, ro],
  )
  const withSignal = rows.filter(hasSignal).length
  const name = title.toLocaleLowerCase('pt-BR')

  return (
    <div
      className={`occurrence-plates${loading ? ' is-loading' : ''}`}
      aria-busy={loading}
    >
      <div className="panel-head">
        <div>
          {heading && <h2>{title}</h2>}
          <p>{description}</p>
          {note && <p className="occurrence-note">{note}</p>}
        </div>
        <div className="occurrence-controls">{controls}</div>
      </div>
      {list && !list.available ? (
        <p className="list-empty">{list.reason}</p>
      ) : !rows.length ? (
        <p className="list-empty">{list ? emptyText : 'Carregando…'}</p>
      ) : (
        <>
          <div className="occurrence-filters">
            <Segments
              label={`Filtro: ${name}`}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'Todas', n: rows.length },
                { value: 'signal', label: 'Com sinal', n: withSignal },
              ]}
            />
            {list?.available && list.with_signal > 0 && (
              <span className="occurrence-signal-counts">
                {signalCounts(list)}
              </span>
            )}
            <label className="occurrence-search-field">
              <Search size={14} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filtrar placa"
                aria-label={`Filtrar placa: ${name}`}
                spellCheck={false}
              />
            </label>
          </div>
          <PlatesTable
            kind={kind}
            label={title}
            ro={ro}
            eventTime={eventTime}
            rows={visible}
            sort={sort}
            onSortChange={setSort}
            onOpenPlate={onOpenPlate}
          />
          {!visible.length && (
            <p className="list-empty">Nenhuma placa com este filtro.</p>
          )}
          {list?.available && (
            <div className="list-footer">
              <span>
                {formatNumber(visible.length)} de {formatNumber(list.total)}{' '}
                placas
                {list.shown < list.total
                  ? ` (a lista traz as ${formatNumber(list.shown)} primeiras na ordem padrão; as com sinal estão todas)`
                  : ''}
              </span>
              <span>Ordem: {SORT_LABELS[sort]}.</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
