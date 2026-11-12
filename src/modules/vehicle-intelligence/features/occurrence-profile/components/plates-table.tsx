import { PlateButton } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { PlateSignals } from '@/modules/vehicle-intelligence/components/plate/plate-signals'
import {
  aroundLabel,
  distanceLabel,
  factDeltaLabel,
  minutesAmount,
  type PlateSort,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  OccurrencePlateRow,
  PlateMarks,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import {
  brasiliaFormatter,
  formatDayMonth,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { titleCaseText } from '@/modules/vehicle-intelligence/lib/labels'

export type PlatesKind = 'together' | 'nearby'

const TIME = brasiliaFormatter({ hour: '2-digit', minute: '2-digit' })
const time = (value: string | null) =>
  value ? TIME.format(parseInstant(value)) : '—'

type Column = {
  key: PlateSort | null
  label: string
  numeric?: boolean
  title?: string
}
/** As colunas que ordenam do menor para o maior (as outras, do maior para o menor). */
const ASCENDING = new Set<PlateSort>(['plate', 'fact_time', 'distance'])
const STRENGTH_TITLE =
  'De 0 a 100: proximidade no tempo e no espaço (ver Critérios). Não mede suspeita.'

const COLUMNS: Record<PlatesKind, Column[]> = {
  together: [
    { key: 'plate', label: 'Placa' },
    { key: 'strength', label: 'Força', numeric: true, title: STRENGTH_TITLE },
    { key: 'together', label: 'Junto da vítima', numeric: true },
    { key: null, label: 'Entre passagens', numeric: true },
    { key: 'fact_time', label: 'Tempo do fato', numeric: true },
    { key: null, label: 'Onde' },
    { key: null, label: 'Horário' },
  ],
  nearby: [
    { key: 'plate', label: 'Placa' },
    { key: 'strength', label: 'Força', numeric: true, title: STRENGTH_TITLE },
    { key: 'together', label: 'Leituras', numeric: true },
    { key: 'fact_time', label: 'Tempo do fato', numeric: true },
    { key: 'distance', label: 'Distância', numeric: true },
    { key: null, label: 'Horário' },
  ],
}

/** A placa, as marcas deste RO (citada no relato dele, compatível com um trecho dele, vítima dele) e as etiquetas do
 * ranking. As marcas deste RO usam as mesmas etiquetas do resto do painel; a citação em outros ROs fica na de sempre. */
export function PlateCell({
  row,
  ro,
  onOpenPlate,
}: {
  row: Omit<PlateMarks, 'plate'> & { plate: string }
  ro: string
  onOpenPlate: (plate: string) => void
}) {
  const others = row.author_citations.filter((item) => item.ro !== ro)
  const compatible = row.compatible_with ?? []
  return (
    <>
      <PlateButton plate={row.plate} onOpen={onOpenPlate} />
      <div className="occurrence-chips">
        {row.cited_here && (
          <span
            className="signal-chip signal-cited"
            title="Citada como veículo dos autores na dinâmica deste RO"
          >
            <i aria-hidden="true" />
            CITADA NESTE RO
          </span>
        )}
        {compatible.length > 0 && (
          <span
            className="signal-chip signal-cited occurrence-compatible"
            title={`Compatível com ${compatible.map((item) => `“${item}”`).join(', ')}, trecho de placa citado na dinâmica deste RO. Não é a placa citada.`}
          >
            <i aria-hidden="true" />
            Compatível com trecho citado
          </span>
        )}
        {row.is_victim_here && (
          <span className="signal-chip occurrence-victim-chip">
            <i aria-hidden="true" />
            Vítima deste RO
          </span>
        )}
        <PlateSignals row={{ ...row, author_citations: others }} />
      </div>
    </>
  )
}

function Cells({
  kind,
  row,
  eventTime,
}: {
  kind: PlatesKind
  row: OccurrencePlateRow
  eventTime: string | null
}) {
  const hours = (
    <span role="cell" className="num-text">
      <span className="nowrap">
        {time(row.first_seen)}
        {row.last_seen && row.last_seen !== row.first_seen
          ? `–${time(row.last_seen)}`
          : ''}
      </span>
      <small>
        {formatDayMonth(row.first_seen)} ·{' '}
        {aroundLabel(
          row.before,
          row.after,
          kind === 'together' ? 'da vítima' : 'do fato',
        )}
      </small>
    </span>
  )
  const factTime = (average: string) => (
    <span role="cell" className="num">
      <span className="light">
        {factDeltaLabel(row.min_fact_delta_minutes, row, eventTime)}
      </span>
      <small>{average}</small>
    </span>
  )
  if (kind === 'together')
    return (
      <>
        <span role="cell" className="num">
          <span className="light">{formatNumber(row.cooccurrences)}</span>
          <small>{row.victims?.length ? row.victims.join(', ') : ''}</small>
        </span>
        <span role="cell" className="num">
          <span className="light">
            {minutesAmount(row.min_passage_delta_minutes)}
          </span>
          <small>mediana {minutesAmount(row.passage_delta_minutes)}</small>
        </span>
        {factTime(`vítima a ${minutesAmount(row.victim_fact_delta_minutes)}`)}
        <span role="cell">
          <span className="occurrence-places">
            {row.places ? titleCaseText(row.places) : '—'}
          </span>
          <small>
            ponto a {distanceLabel(row.min_fact_distance_meters)} do fato
          </small>
        </span>
        {hours}
      </>
    )
  return (
    <>
      <span role="cell" className="num">
        <span className="light">{formatNumber(row.readings)}</span>
        <small>
          {formatNumber(row.points.length)}{' '}
          {row.points.length === 1 ? 'ponto' : 'pontos'}
        </small>
      </span>
      {factTime(`média ${minutesAmount(row.fact_delta_minutes)}`)}
      <span role="cell" className="num">
        <span className="light">
          {distanceLabel(row.min_fact_distance_meters)}
        </span>
        <small>média {distanceLabel(row.avg_fact_distance_meters)}</small>
      </span>
      {hours}
    </>
  )
}

/** A tabela de uma lista: a placa com as marcas e as etiquetas, a força e as colunas da lista. */
export function PlatesTable({
  kind,
  label,
  ro,
  eventTime,
  rows,
  sort,
  onSortChange,
  onOpenPlate,
}: {
  kind: PlatesKind
  label: string
  ro: string
  eventTime: string | null
  rows: OccurrencePlateRow[]
  sort: PlateSort
  onSortChange: (sort: PlateSort) => void
  onOpenPlate: (plate: string) => void
}) {
  return (
    <div
      className={`list occurrence-list occurrence-list-${kind}`}
      role="table"
      aria-label={label}
    >
      <div className="list-head" role="row">
        {COLUMNS[kind].map(({ key, label: column, numeric, title }) =>
          key ? (
            <span
              key={column}
              role="columnheader"
              aria-sort={
                sort === key
                  ? ASCENDING.has(key)
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              className={numeric ? 'num' : undefined}
            >
              <button
                type="button"
                className={`list-sort${sort === key ? ' active' : ''}`}
                onClick={() => onSortChange(sort === key ? 'signal' : key)}
                title={
                  sort === key
                    ? 'Voltar à ordem padrão (com sinal primeiro)'
                    : title
                }
              >
                {column}
                {sort === key ? (ASCENDING.has(key) ? ' ↑' : ' ↓') : ''}
              </button>
            </span>
          ) : (
            <span
              key={column}
              role="columnheader"
              className={numeric ? 'num' : undefined}
            >
              {column}
            </span>
          ),
        )}
      </div>
      {rows.map((row, index) => (
        <div
          key={row.plate}
          role="row"
          className={`list-row${index % 2 ? ' pair' : ''}`}
        >
          <span role="cell">
            <PlateCell row={row} ro={ro} onOpenPlate={onOpenPlate} />
          </span>
          <span role="cell" className="num">
            <span className="light">
              {row.correlation_strength == null
                ? '—'
                : row.correlation_strength.toLocaleString('pt-BR', {
                    maximumFractionDigits: 1,
                  })}
            </span>
          </span>
          <Cells kind={kind} row={row} eventTime={eventTime} />
        </div>
      ))}
    </div>
  )
}
