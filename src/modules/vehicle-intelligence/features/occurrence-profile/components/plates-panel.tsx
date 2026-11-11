import { ArrowDownUp, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Segments } from '@/modules/vehicle-intelligence/components/groups/controls'
import {
  type PlatesKind,
  PlatesTable,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plates-table'
import {
  hasSignal,
  type PlateSort,
  SORT_TABS,
  sortLabel,
  sortRows,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type { OccurrencePlateList } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

type Filter = 'all' | 'signal'

/** Linhas por lista na ordem pedida (`analise.ocorrencia.LIMITE_LINHAS`); as com sinal vêm além delas. */
const LIMIT = 300

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

/** As abas de ordem da lista e, ao lado, o sentido (que troca com um clique). A ordem é feita na API. */
function SortTabs({
  kind,
  sort,
  inverted,
  onSortChange,
  onInvertedChange,
}: {
  kind: PlatesKind
  sort: PlateSort
  inverted: boolean
  onSortChange: (sort: PlateSort) => void
  onInvertedChange: (inverted: boolean) => void
}) {
  return (
    <div className="occurrence-sort-tabs">
      <div
        role="group"
        aria-label="Ordem da lista"
        className="occurrence-sort-tablist"
      >
        {SORT_TABS.map(([value, label]) => (
          <button
            key={value}
            id={`occurrence-sort-${kind}-${value}`}
            type="button"
            aria-pressed={sort === value}
            className={sort === value ? 'active' : undefined}
            onClick={() => {
              onSortChange(value)
              onInvertedChange(false)
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {sort !== 'signal' && (
        <button
          type="button"
          className="occurrence-sort-direction"
          aria-label={`Inverter a ordem (agora: ${sortLabel(sort, inverted)})`}
          onClick={() => onInvertedChange(!inverted)}
        >
          <ArrowDownUp size={14} aria-hidden="true" />
          <span>{sortLabel(sort, inverted, true)}</span>
        </button>
      )}
    </div>
  )
}

/** Uma das listas do perfil (junto da vítima ou perto do local): o que ela é, as abas de ordem, o filtro de sinal, a
 * busca, a tabela e o rodapé. A ordem é feita na API (antes do limite de linhas); os filtros ficam no trilho ao lado. */
export function PlatesPanel({
  kind,
  ro,
  eventTime,
  list,
  loading,
  title,
  description,
  emptyText,
  sort,
  inverted,
  applied,
  onSortChange,
  onInvertedChange,
  onOpenPlate,
}: {
  kind: PlatesKind
  ro: string
  eventTime: string | null
  list: OccurrencePlateList | null
  loading: boolean
  title: string
  description: string
  emptyText: string
  sort: PlateSort
  inverted: boolean
  /** A ordem dos dados na tela (a que a API aplicou): a tabela e o rodapé seguem ela enquanto a nova não chega. */
  applied: [PlateSort, boolean]
  onSortChange: (sort: PlateSort) => void
  onInvertedChange: (inverted: boolean) => void
  onOpenPlate: (plate: string) => void
}) {
  const [shownSort, shownInverted] = applied
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const rows = useMemo(() => (list?.available ? list.rows : []), [list])
  const term = search.trim().toUpperCase()
  // A API já ordena; só a ordem do sinal é refinada aqui (citada neste RO, em outro, Cerco...).
  const visible = useMemo(() => {
    const kept = rows.filter(
      (row) =>
        (filter === 'all' || hasSignal(row)) &&
        (!term || row.plate.includes(term)),
    )
    return shownSort === 'signal' ? sortRows(kept, 'signal', ro) : kept
  }, [rows, filter, term, shownSort, ro])
  const withSignal = rows.filter(hasSignal).length
  const name = title.toLocaleLowerCase('pt-BR')
  // Os filtros do trilho tiram placas na API: a lista diz quantas eram sem eles.
  const filteredOut = list?.available ? list.unfiltered_total - list.total : 0
  const empty =
    list?.available && filteredOut > 0
      ? `Nenhuma das ${formatNumber(list.unfiltered_total)} placas desta lista passa nos filtros ao lado.`
      : emptyText
  // As com sinal que ficaram além das primeiras da ordem.
  const extra = list?.available
    ? Math.max(0, list.shown - Math.min(list.total, LIMIT))
    : 0

  return (
    <div
      className={`occurrence-plates${loading ? ' is-loading' : ''}`}
      aria-busy={loading}
    >
      <p className="occurrence-list-description">{description}</p>
      {list && !list.available ? (
        <p className="list-empty">{list.reason}</p>
      ) : !rows.length ? (
        <p className="list-empty">{list ? empty : 'Carregando…'}</p>
      ) : (
        <>
          <SortTabs
            kind={kind}
            sort={sort}
            inverted={inverted}
            onSortChange={onSortChange}
            onInvertedChange={onInvertedChange}
          />
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
            sort={shownSort}
            inverted={shownInverted}
            onSortChange={(next) => {
              onSortChange(next)
              onInvertedChange(false)
            }}
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
                {filteredOut > 0
                  ? ` que passam nos filtros (${formatNumber(list.unfiltered_total)} sem eles)`
                  : ''}
                {list.shown < list.total
                  ? ` (a lista traz as ${formatNumber(list.shown - extra)} primeiras nesta ordem${extra ? ` e as outras ${formatNumber(extra)} com sinal` : ', com todas as com sinal'})`
                  : ''}
              </span>
              <span>Ordem: {sortLabel(shownSort, shownInverted)}.</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
