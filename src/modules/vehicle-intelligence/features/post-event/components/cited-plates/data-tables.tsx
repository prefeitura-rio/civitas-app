import { useMemo, useState } from 'react'

import { CirculationTable } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/circulation-table'
import { DisconnectionsTable } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/disconnections-table'
import { RankingTable } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/ranking-table'
import type { PostEventData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'

export function DataTables({
  data,
  onOpenPlate,
}: {
  data: PostEventData
  onOpenPlate: (plate: string) => void
}) {
  const [tab, setTab] = useState('ranking')
  const [sort, setSort] = useState('rank')
  const [ascending, setAscending] = useState(true)
  const ranking = useMemo(
    () =>
      [...data.ranking].sort((a, b) => {
        const left = Number(a[sort as keyof typeof a] ?? 0)
        const right = Number(b[sort as keyof typeof b] ?? 0)
        return (ascending ? left - right : right - left) || a.rank - b.rank
      }),
    [data.ranking, sort, ascending],
  )
  const sortBy = (key: string) => {
    setAscending(sort === key ? !ascending : key === 'rank')
    setSort(key)
  }
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">DADOS DO PÓS-FATO</span>
          <h2>Placas citadas e desconexões</h2>
          <p>
            Circulação de {formatDate(data.methodology.period_start)} a{' '}
            {formatDate(data.methodology.period_end)}. Acompanhamento do fato
            até o primeiro hiato &gt;{data.methodology.hiatus_hours}h, ou até o
            fim dos dados quando inconclusivo.
          </p>
        </div>
      </div>
      <div className="post-tabs" role="tablist" aria-label="Dados do pós-fato">
        {[
          ['ranking', 'Placas citadas'],
          ['disconnections', 'Desconexões'],
          ['daily', 'Circulação por dia'],
          ['hours', 'Horários'],
          ['weekdays', 'Dias da semana'],
        ].map(([id, label]) => (
          <button
            type="button"
            id={`post-tab-${id}`}
            aria-controls="post-data"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'active' : ''}
            key={id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id="post-data"
        role="tabpanel"
        aria-labelledby={`post-tab-${tab}`}
        className="table-scroll post-table"
      >
        {tab === 'ranking' && (
          <RankingTable
            rows={ranking}
            sort={sort}
            ascending={ascending}
            onSort={sortBy}
            onOpenPlate={onOpenPlate}
          />
        )}
        {tab === 'disconnections' && (
          <DisconnectionsTable
            rows={data.disconnections}
            onOpenPlate={onOpenPlate}
          />
        )}
        {tab === 'daily' && (
          <CirculationTable
            heading="Dia"
            rows={data.daily.map((row) => ({
              ...row,
              key: row.day,
              label: row.day.split('-').reverse().join('/'),
            }))}
          />
        )}
        {tab === 'hours' && (
          <CirculationTable
            heading="Hora · Brasília"
            rows={data.hours.map((row) => ({
              ...row,
              key: row.hour,
              label: `${String(row.hour).padStart(2, '0')}h`,
            }))}
          />
        )}
        {tab === 'weekdays' && (
          <CirculationTable
            heading="Dia da semana"
            rows={data.weekdays.map((row) => ({
              ...row,
              key: row.weekday,
              label: WEEKDAYS[row.weekday - 1],
            }))}
          />
        )}
      </div>
    </section>
  )
}

const WEEKDAYS = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
]
