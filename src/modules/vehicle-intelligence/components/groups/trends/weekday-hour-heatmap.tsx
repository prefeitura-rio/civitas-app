import { useMemo, useRef, useState } from 'react'

import { EventList } from '@/modules/vehicle-intelligence/components/groups/trends/event-list'
import {
  capitalize,
  factsText,
  hourRange,
  shareOfTotal,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
} from '@/modules/vehicle-intelligence/components/groups/trends/trend-text'
import type { TrendsData } from '@/modules/vehicle-intelligence/components/groups/trends/trends-data'
import {
  interactive,
  useTooltip,
} from '@/modules/vehicle-intelligence/components/groups/trends/use-tooltip'
import type { GroupEvent } from '@/modules/vehicle-intelligence/types/groups'

type HeatmapFocus = { day: number | null; hour: number | null }

/** Dia da semana × hora: o mapa de calor, o total por hora (barras) e por dia; o balão lista os ROs. */
export function WeekdayHourHeatmap({ data }: { data: TrendsData }) {
  const area = useRef<HTMLElement>(null)
  const { show, hide, bubble } = useTooltip(area)
  const [highlight, setHighlight] = useState<HeatmapFocus>({
    day: null,
    hour: null,
  })
  const eventsByCell = useMemo(() => {
    const cells = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => [] as GroupEvent[]),
    )
    // `weekday` vem de 1 (segunda) a 7 (domingo).
    data.events.forEach((groupEvent) => {
      cells[groupEvent.weekday - 1][groupEvent.hour].push(groupEvent)
    })
    return cells
  }, [data.events])
  const matrix = eventsByCell.map((row) => row.map((cell) => cell.length))
  const total = data.events.length
  const maximum = Math.max(1, ...matrix.flat())
  const hourTotals = data.trends?.hours ?? Array<number>(24).fill(0)
  const weekdayTotals = data.trends?.weekdays ?? Array<number>(7).fill(0)
  const maxHour = Math.max(1, ...hourTotals)
  const maxWeekday = Math.max(1, ...weekdayTotals)
  let peakDay = 0
  let peakHour = 0
  matrix.forEach((row, d) =>
    row.forEach((value, h) => {
      if (value > matrix[peakDay][peakHour]) {
        peakDay = d
        peakHour = h
      }
    }),
  )
  // A janela de 3 h com mais fatos (circular: 23h, 0h, 1h).
  let windowStart = 0
  let windowBest = -1
  for (let h = 0; h < 24; h += 1) {
    const sum =
      hourTotals[h] + hourTotals[(h + 1) % 24] + hourTotals[(h + 2) % 24]
    if (sum > windowBest) {
      windowBest = sum
      windowStart = h
    }
  }
  const percent = Math.round((100 * windowBest) / Math.max(1, total))
  const cellColor = (value: number) =>
    value
      ? `rgba(24,199,221,${(0.22 + (0.78 * value) / maximum).toFixed(2)})`
      : 'rgba(232,246,250,.035)'

  const leave = () => {
    setHighlight({ day: null, hour: null })
    hide()
  }
  const cellProps = (d: number, h: number) =>
    interactive(
      (target) => {
        setHighlight({ day: d, hour: h })
        const value = matrix[d][h]
        show(
          target,
          <>
            <strong className="group-tip-title">
              {capitalize(WEEKDAY_NAMES[d])}, {hourRange(h)}
            </strong>
            <span className="group-tip-row">
              <b>{factsText(value)}</b>
              {value > 0 && <em>{shareOfTotal(value, total)}</em>}
            </span>
            <EventList events={eventsByCell[d][h]} />
          </>,
        )
      },
      leave,
      `${WEEKDAY_NAMES[d]}, ${hourRange(h)}: ${factsText(matrix[d][h])}`,
    )
  const hourBarProps = (h: number) =>
    interactive(
      (target) => {
        setHighlight({ day: null, hour: h })
        const busiestDay = matrix.reduce(
          (bestDay, row, d) => (row[h] > matrix[bestDay][h] ? d : bestDay),
          0,
        )
        show(
          target,
          <>
            <strong className="group-tip-title">
              {hourRange(h)}, todos os dias
            </strong>
            <span className="group-tip-row">
              <b>{factsText(hourTotals[h])}</b>
              {hourTotals[h] > 0 && (
                <em>{shareOfTotal(hourTotals[h], total)}</em>
              )}
            </span>
            {hourTotals[h] > 0 && (
              <span className="group-tip-note">
                Dia mais cheio nessa hora: {WEEKDAY_NAMES[busiestDay]} (
                {factsText(matrix[busiestDay][h])})
              </span>
            )}
          </>,
        )
      },
      leave,
      `${hourRange(h)}: ${factsText(hourTotals[h])}`,
    )
  const dayTotalProps = (d: number) =>
    interactive(
      (target) => {
        setHighlight({ day: d, hour: null })
        const busiestHour = matrix[d].reduce(
          (bestHour, value, h) => (value > matrix[d][bestHour] ? h : bestHour),
          0,
        )
        show(
          target,
          <>
            <strong className="group-tip-title">
              {capitalize(WEEKDAY_NAMES[d])}, o dia todo
            </strong>
            <span className="group-tip-row">
              <b>{factsText(weekdayTotals[d])}</b>
              {weekdayTotals[d] > 0 && (
                <em>{shareOfTotal(weekdayTotals[d], total)}</em>
              )}
            </span>
            {weekdayTotals[d] > 0 && (
              <span className="group-tip-note">
                Hora mais cheia: {hourRange(busiestHour)} (
                {factsText(matrix[d][busiestHour])})
              </span>
            )}
          </>,
        )
      },
      leave,
      `${WEEKDAY_NAMES[d]}: ${factsText(weekdayTotals[d])}`,
    )
  const inRow = (d: number) => highlight.day === d
  const inColumn = (h: number) => highlight.hour === h

  return (
    <figure className="group-heat" ref={area}>
      <figcaption>
        <span>
          <span className="group-figure-title">Dia da semana × hora</span>
          <span className="group-figure-summary">
            {percent}% dos fatos entre {windowStart}h e {(windowStart + 3) % 24}
            h · célula mais cheia: {WEEKDAY_NAMES[peakDay]}, {peakHour}h (
            {factsText(matrix[peakDay][peakHour])})
          </span>
        </span>
        <span className="group-heat-scale">
          Menos
          {[0.035, 0.3, 0.5, 0.75, 1].map((a, i) => (
            <i
              key={a}
              style={{
                background: i
                  ? `rgba(24,199,221,${a})`
                  : 'rgba(232,246,250,.035)',
              }}
            />
          ))}
          Mais
        </span>
      </figcaption>
      <div className="group-heat-grid" onPointerLeave={leave}>
        <span />
        {hourTotals.map((value, h) => (
          <span
            key={`hh${h}`}
            className={`group-heat-bar${inColumn(h) ? ' active' : ''}`}
            {...hourBarProps(h)}
          >
            <i style={{ height: `${(100 * value) / maxHour}%` }} />
          </span>
        ))}
        <span className="group-heat-total-label">total</span>
        {matrix.map((row, d) => [
          <span
            key={`d${d}`}
            className={`group-heat-day${inRow(d) ? ' active' : ''}`}
          >
            {WEEKDAY_SHORT[d]}
          </span>,
          ...row.map((value, h) => (
            <span
              key={`c${d}-${h}`}
              className={`group-heat-cell${inRow(d) && inColumn(h) ? ' active' : ''}`}
              {...cellProps(d, h)}
              tabIndex={value ? 0 : -1}
              style={{
                background: cellColor(value),
                color: value / maximum > 0.55 ? '#071114' : '#e6f6f8',
              }}
            >
              {value >= 2 ? value : ''}
            </span>
          )),
          <span
            key={`t${d}`}
            className={`group-heat-total${inRow(d) && highlight.hour === null ? ' active' : ''}`}
            {...dayTotalProps(d)}
          >
            <i>
              <i
                style={{ width: `${(100 * weekdayTotals[d]) / maxWeekday}%` }}
              />
            </i>
            <b>{weekdayTotals[d]}</b>
          </span>,
        ])}
        <span />
        {hourTotals.map((_, h) => (
          <span
            key={`r${h}`}
            className={`group-heat-hour${inColumn(h) ? ' active' : ''}`}
          >
            {h % 3 === 0 || inColumn(h) ? `${h}h` : ''}
          </span>
        ))}
        <span />
      </div>
      {bubble}
    </figure>
  )
}
