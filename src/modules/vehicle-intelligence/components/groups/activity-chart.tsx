/**
 * Começos e fins de leitura (perfil do território e do grupo), redesign de 14/10: as placas semana a semana, em
 * qualquer câmera, em abas (pararam, começaram, começaram e pararam, lidas o período todo), com a primeira e a última
 * leitura em colunas. Nas abas das que pararam, a placa que começou logo depois (possível troca de moto) vem logo abaixo
 * da que parou, recuada; ela não conta na aba.
 *
 * Vocabulário: no território, as etiquetas do ranking (CERCO, CITADA NO RELATO); no grupo, o ponto na cor da placa e os
 * sinais em texto com anel, como em Membros. A placa de fora do grupo (troca) tem ponto vazado e não entra no total.
 */
import { useMemo, useRef, useState } from 'react'

import { Segments } from '@/modules/vehicle-intelligence/components/groups/controls'
import {
  PlateButton,
  PlateMarks,
  PlateTags,
} from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import {
  formatDayMonth,
  formatDayMonthYear,
  MONTH_ABBREVIATIONS,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import type {
  ActivityPlate,
  ActivitySeries,
} from '@/modules/vehicle-intelligence/types/groups'

const DAY_MS = 86_400_000
const ms = (day: string) => Date.parse(`${day}T00:00:00Z`)
const iso = (value: number) => new Date(value).toISOString().slice(0, 10)
/** Segunda-feira da semana do dia (a `date_trunc('week')` do motor). */
const mondayOf = (day: string) => {
  const t = ms(day)
  return iso(t - ((new Date(t).getUTCDay() + 6) % 7) * DAY_MS)
}
/** Dias com leitura na semana (1 a 7) no ciano da série; semana sem leitura dentro do período lido, quase apagada. */
const weekColor = (days: number) =>
  days
    ? `rgba(24,199,221,${(0.25 + (0.75 * days) / 7).toFixed(2)})`
    : 'rgba(232,246,250,.07)'

/** Uma placa da série: a nota abaixo dela ("4ª no ranking · G1"), a posição no ranking (ordem de "Lidas o período todo"),
 * a cor da placa (no grupo) e se ela é de fora do grupo (a placa que começou numa troca). */
export interface ActivityRow {
  plate: string
  cited: boolean
  note: string
  rank: number | null
  color?: string
  outside?: boolean
}
/** Possível troca de moto: `from` parou e `to` começou (`gap_days` negativo = começou antes de a outra parar). */
export interface ActivityPair {
  from: string
  to: string
  gap_days: number
}

type Tab = 'stopped' | 'started' | 'both' | 'always'
const TABS: Array<[Tab, string]> = [
  ['stopped', 'Pararam'],
  ['started', 'Começaram'],
  ['both', 'Começaram e pararam'],
  ['always', 'Lidas o período todo'],
]
const tabOf = (p: ActivityPlate): Tab =>
  p.started && p.stopped
    ? 'both'
    : p.stopped
      ? 'stopped'
      : p.started
        ? 'started'
        : 'always'
/** As abas em que a placa que começou logo depois entra embaixo da que parou. */
const TABS_WITH_SUCCESSION = new Set<Tab>(['stopped', 'both'])

const gapText = (days: number) =>
  days === 0
    ? 'no mesmo dia'
    : days < 0
      ? `${-days} d antes`
      : `${days} d depois`
/** "troca de A, B, C e mais 2". */
const listPlates = (plates: string[]) =>
  plates.length > 3
    ? `${plates.slice(0, 3).join(', ')} e mais ${plates.length - 3}`
    : plates.join(', ')

interface Entry {
  plate: ActivityPlate
  pair: ActivityPair | null
}

export function ActivityChart({
  activity,
  rows,
  pairs,
  onOpenPlate,
  description,
  vocabulary = 'territory',
  emptyText = 'Nenhuma placa nesta aba.',
}: {
  activity: ActivitySeries
  rows: ActivityRow[]
  pairs: ActivityPair[]
  onOpenPlate: (plate: string) => void
  description: string
  vocabulary?: 'territory' | 'group'
  emptyText?: string
}) {
  const [chosenTab, setChosenTab] = useState<Tab | null>(null)
  const isInCerco = useIsInCerco()
  const isGroup = vocabulary === 'group'
  const scroller = useRef<HTMLDivElement>(null)
  const weeks = useMemo(() => {
    const list: string[] = []
    for (
      let t = ms(mondayOf(activity.first_day));
      t <= ms(activity.last_day);
      t += 7 * DAY_MS
    )
      list.push(iso(t))
    return list
  }, [activity])
  const weekLabels = useMemo(() => weeks.map((s) => formatDayMonth(s)), [weeks])
  const rowsByPlate = useMemo(
    () => new Map(rows.map((r) => [r.plate, r])),
    [rows],
  )
  const plates = useMemo(
    () => activity.plates.filter((p) => rowsByPlate.has(p.plate)),
    [activity, rowsByPlate],
  )
  const seriesByPlate = useMemo(
    () => new Map(plates.map((p) => [p.plate, p])),
    [plates],
  )
  const successions = useMemo(
    () =>
      pairs.filter(
        (pair) => seriesByPlate.has(pair.from) && seriesByPlate.has(pair.to),
      ),
    [pairs, seriesByPlate],
  )
  const platesByTab = useMemo(() => {
    const tabs: Record<Tab, ActivityPlate[]> = {
      stopped: [],
      started: [],
      both: [],
      always: [],
    }
    plates.forEach((p) => tabs[tabOf(p)].push(p))
    tabs.stopped.sort((a, b) => a.last.localeCompare(b.last))
    tabs.started.sort((a, b) => a.first.localeCompare(b.first))
    tabs.both.sort((a, b) => a.first.localeCompare(b.first))
    tabs.always.sort(
      (a, b) =>
        (rowsByPlate.get(a.plate)?.rank ?? 1e9) -
          (rowsByPlate.get(b.plate)?.rank ?? 1e9) ||
        a.plate.localeCompare(b.plate),
    )
    return tabs
  }, [plates, rowsByPlate])
  const tab =
    chosenTab ?? TABS.find(([key]) => platesByTab[key].length)?.[0] ?? 'stopped'
  const entries: Entry[] = platesByTab[tab].flatMap((plate) => [
    { plate, pair: null },
    ...(TABS_WITH_SUCCESSION.has(tab)
      ? successions
          .filter((pair) => pair.from === plate.plate)
          .map((pair) => ({ plate: seriesByPlate.get(pair.to)!, pair }))
      : []),
  ])
  // O total é das placas do território ou do grupo: a de fora (troca) não conta.
  const ownPlates = plates.filter((p) => !rowsByPlate.get(p.plate)?.outside)
  const changed = ownPlates.filter((p) => tabOf(p) !== 'always').length
  const historyStart = iso(
    ms(activity.first_day) + activity.margin_days * DAY_MS,
  )
  const trackStyle = {
    gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
  }

  const noteFor = ({ plate, pair }: Entry) => {
    const parts = [rowsByPlate.get(plate.plate)?.note]
    if (!pair) {
      const before = successions
        .filter((t) => t.to === plate.plate)
        .map((t) => t.from)
      if (before.length) parts.push(`troca de ${listPlates(before)}`)
      const after = successions
        .filter((t) => t.from === plate.plate)
        .map((t) => t.to)
      if (after.length && !TABS_WITH_SUCCESSION.has(tab))
        parts.push(`troca → ${listPlates(after)}`)
    }
    return parts.filter(Boolean).join(' · ')
  }
  const fewDays = (p: ActivityPlate) => p.days < activity.minimum_days
  const fewDaysWarning = (p: ActivityPlate) =>
    `Só ${pluralize(p.days, 'dia lido', 'dias lidos')}: com menos de ${activity.minimum_days} não conta começo nem fim.`
  // Primeira e última leitura: a data quando começou/parou; com poucos dias lidos, a data em cinza; senão, o texto da borda.
  const dateCell = (
    p: ActivityPlate,
    marked: boolean,
    value: string,
    edgeText: string,
    edgeWarning: string,
  ) =>
    marked ? (
      <span role="cell" className="light">
        {formatDayMonthYear(value)}
      </span>
    ) : (
      <span
        role="cell"
        className="empty"
        title={fewDays(p) ? fewDaysWarning(p) : edgeWarning}
      >
        {fewDays(p) ? formatDayMonthYear(value) : edgeText}
      </span>
    )
  let stripe = 0

  return (
    <>
      <div className="panel-head activity-head">
        <div>
          <h2>Começos e fins de leitura</h2>
          <p>{description}</p>
        </div>
        <Segments
          label="Começos e fins"
          value={tab}
          onChange={(value) => {
            setChosenTab(value)
            if (scroller.current) scroller.current.scrollTop = 0
          }}
          options={TABS.map(([value, text]) => ({
            value,
            label: text,
            n: platesByTab[value].length,
          }))}
        />
      </div>
      <div
        ref={scroller}
        className={`list activity-list${isGroup ? ' grouped' : ''}`}
        role="table"
        aria-label="Começos e fins de leitura, por placa e semana"
      >
        <div className="list-head" role="row">
          <span role="columnheader">Placa</span>
          <span role="columnheader">Primeira leitura</span>
          <span role="columnheader">Última leitura</span>
          <span
            role="columnheader"
            className="activity-months"
            style={trackStyle}
          >
            {weeks.map((s, i) => {
              const month =
                i === 0 ? activity.first_day.slice(5, 7) : s.slice(5, 7)
              const isNewMonth =
                i === 0
                  ? s.slice(5, 7) === month
                  : month !== weeks[i - 1].slice(5, 7)
              return (
                <b key={s}>
                  {isNewMonth ? MONTH_ABBREVIATIONS[Number(month) - 1] : ''}
                </b>
              )
            })}
          </span>
        </div>
        {entries.map((entry) => {
          const { plate: p, pair } = entry
          const row = rowsByPlate.get(p.plate)
          if (!pair) stripe += 1
          const i0 = weeks.indexOf(mondayOf(p.first))
          const i1 = weeks.indexOf(mondayOf(p.last))
          return (
            <div
              key={pair ? `${pair.from}>${p.plate}` : p.plate}
              role="row"
              className={`list-row${pair ? ' switch' : stripe % 2 ? '' : ' pair'}`}
            >
              <span role="cell" className="activity-plate">
                {pair && (
                  <small className="activity-switch">
                    ↳ possível troca · começou {gapText(pair.gap_days)}
                  </small>
                )}
                {isGroup ? (
                  <>
                    <span className="activity-plate-row">
                      <i
                        className={`activity-point${row?.outside ? ' outside' : ''}`}
                        style={
                          row?.outside ? undefined : { background: row?.color }
                        }
                        aria-hidden="true"
                      />
                      <PlateButton plate={p.plate} onOpen={onOpenPlate} />
                    </span>
                    {(isInCerco(p.plate) || row?.cited) && (
                      <span className="activity-indent">
                        <PlateMarks
                          cerco={isInCerco(p.plate)}
                          cited={Boolean(row?.cited)}
                          cercoLabel="No Cerco"
                          cercoRing
                        />
                      </span>
                    )}
                    <small className="activity-indent">{noteFor(entry)}</small>
                  </>
                ) : (
                  <>
                    <span className="list-plate-tags">
                      <PlateButton plate={p.plate} onOpen={onOpenPlate} />
                      <PlateTags plate={p.plate} cited={Boolean(row?.cited)} />
                    </span>
                    <small>{noteFor(entry)}</small>
                  </>
                )}
              </span>
              {dateCell(
                p,
                p.started,
                p.first,
                `antes de ${formatDayMonth(historyStart)}`,
                `Primeira leitura em ${formatDayMonthYear(p.first)}: nos primeiros ${activity.margin_days} dias do histórico não conta como começo.`,
              )}
              {dateCell(
                p,
                p.stopped,
                p.last,
                'segue lida',
                `Última leitura em ${formatDayMonthYear(p.last)}: nos últimos ${activity.margin_days} dias do histórico não conta como fim.`,
              )}
              <span role="cell" className="activity-weeks" style={trackStyle}>
                {weeks.map((s, i) => {
                  const inRange = i >= i0 && i <= i1
                  const days = p.weeks[s] ?? 0
                  return (
                    <i
                      key={s}
                      style={
                        inRange ? { background: weekColor(days) } : undefined
                      }
                      title={
                        inRange
                          ? `Semana de ${weekLabels[i]}: ${days} ${days === 1 ? 'dia' : 'dias'} com leitura`
                          : undefined
                      }
                    />
                  )
                })}
              </span>
            </div>
          )
        })}
        {!entries.length && (
          <p className="list-empty">
            {plates.length ? emptyText : 'Nenhuma placa na série.'}
          </p>
        )}
      </div>
      <div className="list-footer">
        <span>
          {formatNumber(changed)} de {formatNumber(ownPlates.length)} placas
          começaram ou pararam de ser lidas entre{' '}
          {formatDayMonth(activity.first_day)} e{' '}
          {formatDayMonthYear(activity.last_day)}
          {successions.length
            ? ` · ${pluralize(successions.length, 'possível troca', 'possíveis trocas')}`
            : isGroup
              ? ''
              : ' · nenhuma possível troca'}
        </span>
        <span className="activity-scale">
          Dias com leitura na semana: 1
          {[1, 3, 5, 7].map((d) => (
            <i key={d} style={{ background: weekColor(d) }} />
          ))}
          7
          <span>
            <i style={{ background: weekColor(0) }} />
            sem leitura
          </span>
        </span>
      </div>
    </>
  )
}
