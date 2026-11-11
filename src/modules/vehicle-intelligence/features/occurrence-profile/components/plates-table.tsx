import type { CSSProperties, ReactNode } from 'react'

import { PlateButton } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { PlateSignals } from '@/modules/vehicle-intelligence/components/plate/plate-signals'
import {
  DEFAULT_SORT,
  factDeltaLabel,
  plateSignals,
  type PlateSort,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  OccurrencePlateRow,
  PlateMarks,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import {
  formatDayMonth,
  formatTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatDecimal,
  formatDistance,
  formatMinutes,
  formatNumber,
  formatPercent,
} from '@/modules/vehicle-intelligence/lib/format'
import { titleCaseText } from '@/modules/vehicle-intelligence/lib/labels'
import {
  vehicleTypeLabel,
  vehicleTypeSourceLabel,
} from '@/modules/vehicle-intelligence/lib/vehicles'

export type PlatesKind = 'together' | 'nearby'

type CellProps = {
  row: OccurrencePlateRow
  ro: string
  eventTime: string | null
}
/** Uma coluna: o título, a ordem do título (nula: não ordena), a largura na grade e a célula. */
type Column = {
  id: string
  label: string
  sort: PlateSort | null
  width: string
  numeric?: boolean
  title?: string
  cell: (props: CellProps) => ReactNode
}

/** As colunas que ordenam do menor para o maior no sentido padrão (as outras, do maior para o menor). */
const ASCENDING = new Set<PlateSort>(['plate', 'fact_time', 'distance'])
const STRENGTH_TITLE =
  'De 0 a 100: proximidade no tempo e no espaço (ver Critérios). Não mede suspeita.'

const plural = (count: number, one: string, many: string) =>
  `${formatNumber(count)} ${count === 1 ? one : many}`

/** "1,3 min antes do fato", "a 3,3 min do fato", "no minuto do fato". */
function factPhrase(row: OccurrencePlateRow, eventTime: string | null): string {
  const label = factDeltaLabel(row.min_fact_delta_minutes, row, eventTime)
  if (label === '—' || label === 'no minuto do fato') return label
  return /(antes|depois)$/.test(label)
    ? `${label} do fato`
    : `a ${label} do fato`
}

function Cell({
  numeric,
  main,
  detail,
  className,
}: {
  numeric?: boolean
  main: ReactNode
  detail?: ReactNode
  className?: string
}) {
  return (
    <span
      role="cell"
      className={
        [numeric ? 'num' : null, className].filter(Boolean).join(' ') ||
        undefined
      }
    >
      <span className="light">{main}</span>
      {detail && <small>{detail}</small>}
    </span>
  )
}

// ---------------------------------------------------------------- colunas comuns às duas listas

/** Horário: a primeira e a última leitura na lista e o tempo até o fato (a coluna da ordem padrão). */
const HOURS: Column = {
  id: 'hours',
  label: 'Horário',
  sort: 'fact_time',
  width: '144px',
  title:
    'Primeira e última leitura na lista; ordena do mais perto do horário do fato ao mais longe.',
  cell: ({ row, eventTime }) => (
    <Cell
      className="num-text"
      main={
        <span className="nowrap">
          {formatTime(row.first_seen)}
          {row.last_seen && row.last_seen !== row.first_seen
            ? `–${formatTime(row.last_seen)}`
            : ''}
        </span>
      }
      detail={`${factPhrase(row, eventTime)} · ${formatDayMonth(row.first_seen)}`}
    />
  ),
}

const VEHICLE_TYPE: Column = {
  id: 'type',
  label: 'Tipo',
  sort: null,
  width: '96px',
  title:
    'Tipo do veículo da placa: o cadastro PRF ou, sem ele, o tipo mais lido pelos equipamentos.',
  cell: ({ row }) => (
    <Cell
      main={vehicleTypeLabel(row.vehicle_type) ?? '—'}
      detail={
        row.vehicle_type_source === 'tipoveiculo' &&
        row.vehicle_type_share != null
          ? `lido · ${formatPercent(row.vehicle_type_share, 0)}`
          : row.vehicle_type_source === 'PRF'
            ? 'PRF'
            : vehicleTypeSourceLabel(row.vehicle_type_source)
      }
    />
  ),
}

const MAKE_MODEL: Column = {
  id: 'model',
  label: 'Marca e modelo',
  sort: null,
  width: 'minmax(150px, 1.2fr)',
  title: 'Do cadastro PRF, com a cor e os anos de fabricação e modelo.',
  cell: ({ row }) => {
    const years = [row.manufacture_year, row.model_year]
      .filter(Boolean)
      .join('/')
    return (
      <Cell
        className="occurrence-model"
        main={
          row.vehicle_model ?? <span className="dim">sem cadastro PRF</span>
        }
        detail={
          [row.vehicle_color, years].filter(Boolean).join(' · ') || undefined
        }
      />
    )
  },
}

const STRENGTH: Column = {
  id: 'strength',
  label: 'Força',
  sort: 'strength',
  width: '64px',
  numeric: true,
  title: STRENGTH_TITLE,
  cell: ({ row }) => (
    <Cell
      numeric
      main={
        row.correlation_strength == null
          ? '—'
          : formatDecimal(row.correlation_strength, 1)
      }
    />
  ),
}

// ---------------------------------------------------------------- colunas de cada lista

const TOGETHER_COLUMNS: Column[] = [
  {
    id: 'together',
    label: 'Junto da vítima',
    sort: 'together',
    width: '112px',
    numeric: true,
    title:
      'Passagens no mesmo ponto que a placa vítima e o menor intervalo entre as duas.',
    cell: ({ row }) => (
      <Cell
        numeric
        main={plural(row.cooccurrences ?? 0, 'passagem', 'passagens')}
        detail={`a ${formatMinutes(row.min_passage_delta_minutes)} da vítima`}
      />
    ),
  },
  {
    id: 'places',
    label: 'Onde',
    sort: null,
    width: 'minmax(130px, 1fr)',
    cell: ({ row }) => (
      <span role="cell">
        <span className="occurrence-places">
          {row.places ? titleCaseText(row.places) : '—'}
        </span>
        <small>
          ponto a {formatDistance(row.min_fact_distance_meters)} do fato
        </small>
      </span>
    ),
  },
  STRENGTH,
]

const NEARBY_COLUMNS: Column[] = [
  {
    id: 'distance',
    label: 'Distância',
    sort: 'distance',
    width: '100px',
    numeric: true,
    cell: ({ row }) => (
      <Cell
        numeric
        main={formatDistance(row.min_fact_distance_meters)}
        detail={`média ${formatDistance(row.avg_fact_distance_meters)}`}
      />
    ),
  },
  {
    id: 'readings',
    label: 'Leituras',
    sort: 'together',
    width: '84px',
    numeric: true,
    cell: ({ row }) => (
      <Cell
        numeric
        main={formatNumber(row.readings)}
        detail={plural(row.points.length, 'ponto', 'pontos')}
      />
    ),
  },
  STRENGTH,
]

// ---------------------------------------------------------------- a coluna da aba, logo depois da placa

const ros = (count: number) => plural(count, 'RO', 'ROs')

const SORTER_COLUMNS: Partial<Record<PlateSort, Column>> = {
  days: {
    id: 'coverage',
    label: 'Cobertura',
    sort: 'days',
    width: '132px',
    numeric: true,
    title:
      'Dias de circulação (a cobertura do grafo): as detecções da placa nos dias em que ela teve correlação ÷ todas as detecções dela no período. Alta: uma placa que quase só aparece nos dias dos fatos.',
    cell: ({ row }) => (
      <Cell
        numeric
        main={row.coverage == null ? '—' : formatPercent(row.coverage)}
        detail={
          row.total_detections
            ? `${formatNumber(row.coverage_detections)} de ${formatNumber(row.total_detections)} detecções · ${plural(row.correlation_days, 'dia', 'dias')}`
            : 'sem detecções no período'
        }
      />
    ),
  },
  same_day: {
    id: 'same-day',
    label: 'No dia do RO',
    sort: 'same_day',
    width: '120px',
    numeric: true,
    title:
      'Correlações no dia do fato: em quantos ROs desse dia a placa aparece no grafo, nestas janelas (conta este). Mais de um: várias suspeitas no mesmo dia.',
    cell: ({ row }) => (
      <Cell
        numeric
        main={ros(row.same_day_ros)}
        detail={`de ${formatNumber(row.linked_ros)} no total`}
      />
    ),
  },
  links: {
    id: 'links',
    label: 'Correlações',
    sort: 'links',
    width: '120px',
    numeric: true,
    title:
      'Em quantos ROs do recorte a placa aparece no grafo, nestas janelas (conta este), e em quantos dias. Muitas correlações costumam ser trânsito comum do lugar.',
    cell: ({ row }) => (
      <Cell
        numeric
        main={ros(row.linked_ros)}
        detail={`em ${plural(row.correlation_days, 'dia', 'dias')}`}
      />
    ),
  },
  signal: {
    id: 'signal',
    label: 'Sinal',
    sort: 'signal',
    width: 'minmax(150px, 1.1fr)',
    title:
      'O sinal mais forte da placa (citada, Cerco, Disque Denúncia, compatível com trecho, clone) e os outros.',
    cell: ({ row, ro }) => {
      const [main, ...others] = plateSignals(row, ro)
      if (!main) return <Cell main={<span className="dim">sem sinal</span>} />
      return (
        <span role="cell">
          <span className="light">{main.label}</span>
          {main.detail && <small className="break">{main.detail}</small>}
          {others.length > 0 && (
            <small>também {others.map((item) => item.short).join(', ')}</small>
          )}
        </span>
      )
    },
  },
}

/** A placa, as marcas deste RO (citada no relato dele, compatível com um trecho dele, vítima dele) e as etiquetas do
 * ranking. As marcas deste RO usam as mesmas etiquetas do resto do painel; a citação em outros ROs fica na de sempre.
 * `vehicle`: com a etiqueta do tipo (a lista tem a coluna Tipo e a tira). */
export function PlateCell({
  row,
  ro,
  vehicle = true,
  onOpenPlate,
}: {
  row: Omit<PlateMarks, 'plate'> & { plate: string }
  ro: string
  vehicle?: boolean
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
        <PlateSignals
          row={{ ...row, author_citations: others }}
          vehicle={vehicle}
        />
      </div>
    </>
  )
}

/** As colunas da lista: a placa, a coluna da aba (na ordem padrão, o próprio horário), o horário, o tipo, a marca e o
 * modelo, e as da lista. */
function columnsFor(kind: PlatesKind, sort: PlateSort): Column[] {
  const sorter = SORTER_COLUMNS[sort]
  return [
    ...(sorter ? [sorter] : []),
    HOURS,
    VEHICLE_TYPE,
    MAKE_MODEL,
    ...(kind === 'together' ? TOGETHER_COLUMNS : NEARBY_COLUMNS),
  ]
}

/** A tabela de uma lista: a placa com as marcas e as etiquetas, a coluna que ordena logo ao lado e as outras. */
export function PlatesTable({
  kind,
  label,
  ro,
  eventTime,
  rows,
  sort,
  inverted,
  onSortChange,
  onOpenPlate,
}: {
  kind: PlatesKind
  label: string
  ro: string
  eventTime: string | null
  rows: OccurrencePlateRow[]
  sort: PlateSort
  inverted: boolean
  onSortChange: (sort: PlateSort) => void
  onOpenPlate: (plate: string) => void
}) {
  const columns = columnsFor(kind, sort)
  const ascending = (key: PlateSort) =>
    ASCENDING.has(key) !== (inverted && sort === key)
  const header: Column = {
    id: 'plate',
    label: 'Placa',
    sort: 'plate',
    width: 'minmax(170px, 1.2fr)',
    cell: () => null,
  }
  const style = {
    '--colunas': [header, ...columns].map((column) => column.width).join(' '),
  } as CSSProperties
  return (
    <div
      className={`list occurrence-list occurrence-list-${kind}`}
      role="table"
      aria-label={label}
      style={style}
    >
      <div className="list-head" role="row">
        {[header, ...columns].map(
          ({ id, sort: key, label: column, numeric, title }) =>
            key ? (
              <span
                key={id}
                role="columnheader"
                aria-sort={
                  sort === key
                    ? ascending(key)
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                className={
                  [numeric ? 'num' : null, sort === key ? 'sorted' : null]
                    .filter(Boolean)
                    .join(' ') || undefined
                }
              >
                <button
                  type="button"
                  className={`list-sort${sort === key ? ' active' : ''}`}
                  onClick={() =>
                    onSortChange(sort === key ? DEFAULT_SORT : key)
                  }
                  title={
                    sort === key
                      ? 'Voltar à ordem padrão (mais perto do horário)'
                      : title
                  }
                >
                  {column}
                  {sort === key && key !== 'signal'
                    ? ascending(key)
                      ? ' ↑'
                      : ' ↓'
                    : ''}
                </button>
              </span>
            ) : (
              <span
                key={id}
                role="columnheader"
                className={numeric ? 'num' : undefined}
                title={title}
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
            <PlateCell
              row={row}
              ro={ro}
              vehicle={false}
              onOpenPlate={onOpenPlate}
            />
          </span>
          {columns.map((column) => (
            <ColumnCell
              key={column.id}
              column={column}
              row={row}
              ro={ro}
              eventTime={eventTime}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function ColumnCell({ column, ...props }: { column: Column } & CellProps) {
  return <>{column.cell(props)}</>
}
