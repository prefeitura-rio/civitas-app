import { useRef, useState } from 'react'

import { EventList } from '@/modules/vehicle-intelligence/components/groups/trends/event-list'
import {
  capitalize,
  MONTH_NAMES,
  rosText,
  shareOfTotal,
} from '@/modules/vehicle-intelligence/components/groups/trends/trend-text'
import type { TrendsData } from '@/modules/vehicle-intelligence/components/groups/trends/trends-data'
import { useTooltip } from '@/modules/vehicle-intelligence/components/groups/trends/use-tooltip'
import { MONTH_ABBREVIATIONS } from '@/modules/vehicle-intelligence/lib/dates'

type SeriesKey = 'all' | 'together'

/** Fatos por mês: todos os ROs e os com 2+ placas (`togetherLabel`), cada linha liga e desliga na legenda. */
export function MonthlySeries({
  data,
  togetherLabel,
}: {
  data: TrendsData
  togetherLabel: string
}) {
  const area = useRef<HTMLElement>(null)
  const plot = useRef<HTMLDivElement>(null)
  const { show, hide, bubble } = useTooltip(area)
  const [activeMonth, setActiveMonth] = useState<number | null>(null)
  const [hidden, setHidden] = useState<ReadonlySet<SeriesKey>>(new Set())
  const events = data.events
  if (!events.length) return null
  const monthIndex = (day: string) =>
    Number(day.slice(0, 4)) * 12 + Number(day.slice(5, 7)) - 1
  const k0 = monthIndex(events[0].day)
  const n = monthIndex(events[events.length - 1].day) - k0 + 1
  const allCounts = Array<number>(n).fill(0)
  const togetherCounts = Array<number>(n).fill(0)
  events.forEach((groupEvent) => {
    const i = monthIndex(groupEvent.day) - k0
    allCounts[i] += 1
    if (groupEvent.plates.length >= 2) togetherCounts[i] += 1
  })
  const maximum = Math.max(...allCounts, 1)
  // Folga acima do pico, arredondada para par (os rótulos ficam em topo, metade e zero).
  const rawTop = maximum + Math.max(1, Math.ceil(maximum * 0.25))
  const axisTop = rawTop % 2 ? rawTop + 1 : rawTop
  const W = 800
  const H = 170
  const xp = (i: number) => (n === 1 ? 50 : 4 + (92 * i) / (n - 1))
  const X = (i: number) => ((xp(i) / 100) * W).toFixed(1)
  const Y = (v: number) => (H - (v / axisTop) * H).toFixed(1)
  const linePoints = allCounts.map((v, i) => `${X(i)},${Y(v)}`).join(' ')
  const peak = allCounts.indexOf(maximum)
  const monthOf = (i: number) => (k0 + i) % 12
  const yearOf = (i: number) => Math.floor((k0 + i) / 12)
  const showAll = !hidden.has('all')
  const showTogether = !hidden.has('together')
  const toggleSeries = (series: SeriesKey) =>
    setHidden((current) => {
      const next = new Set(current)
      if (!next.delete(series)) next.add(series)
      return next
    })

  /** Coluna de cada mês: do meio do anterior ao meio do seguinte, para o mouse achar o mês sem mirar no ponto. */
  const monthColumn = (i: number) => {
    const left = i === 0 ? 0 : (xp(i - 1) + xp(i)) / 2
    const right = i === n - 1 ? 100 : (xp(i) + xp(i + 1)) / 2
    return { left: `${left}%`, width: `${right - left}%` }
  }
  const focusMonth = (i: number) => {
    setActiveMonth(i)
    const box = plot.current?.getBoundingClientRect()
    const figure = area.current?.getBoundingClientRect()
    if (!box || !figure) return
    const monthEvents = events.filter(
      (groupEvent) => monthIndex(groupEvent.day) - k0 === i,
    )
    show(
      plot.current!,
      <>
        <strong className="group-tip-title">
          {capitalize(MONTH_NAMES[monthOf(i)])} de {yearOf(i)}
        </strong>
        {showAll && (
          <span className="group-tip-row">
            <i className="full" aria-hidden="true" />
            <b>{rosText(allCounts[i])}</b>
            <em>todos os ROs</em>
          </span>
        )}
        {showTogether && (
          <span className="group-tip-row">
            <i className="dashed" aria-hidden="true" />
            <b>{rosText(togetherCounts[i])}</b>
            <em>{togetherLabel.toLocaleLowerCase('pt-BR')}</em>
          </span>
        )}
        {allCounts[i] > 0 && (
          <span className="group-tip-note">
            {shareOfTotal(allCounts[i], events.length)}
          </span>
        )}
        <EventList events={monthEvents} />
      </>,
      {
        x: box.left - figure.left + (xp(i) / 100) * box.width,
        y: box.top - figure.top,
        side: xp(i) > 50 ? 'left' : 'right',
      },
    )
  }
  const leave = () => {
    setActiveMonth(null)
    hide()
  }

  return (
    <figure className="group-series" ref={area}>
      <figcaption>
        <span>
          <span className="group-figure-title">Fatos por mês</span>
          <span className="group-figure-summary">
            Média de{' '}
            {(events.length / n).toLocaleString('pt-BR', {
              maximumFractionDigits: 1,
            })}{' '}
            por mês · pico em {MONTH_NAMES[monthOf(peak)]}, com {maximum} ROs
          </span>
        </span>
        <span className="group-series-legend">
          <button
            type="button"
            aria-pressed={showAll}
            className={showAll ? undefined : 'off'}
            onClick={() => toggleSeries('all')}
            title={
              showAll
                ? 'Ocultar a linha de todos os ROs'
                : 'Mostrar a linha de todos os ROs'
            }
          >
            <i className="full" />
            Todos os ROs
          </button>
          <button
            type="button"
            aria-pressed={showTogether}
            className={showTogether ? undefined : 'off'}
            onClick={() => toggleSeries('together')}
            title={
              showTogether
                ? `Ocultar a linha: ${togetherLabel}`
                : `Mostrar a linha: ${togetherLabel}`
            }
          >
            <i className="dashed" />
            {togetherLabel}
          </button>
        </span>
      </figcaption>
      <div className="group-series-body">
        <div className="group-series-axis">
          {[axisTop, axisTop / 2, 0].map((v) => (
            <span
              key={v}
              style={{ top: `${(100 * (1 - v / axisTop)).toFixed(1)}%` }}
            >
              {v}
            </span>
          ))}
        </div>
        <div className="group-series-area" ref={plot} onPointerLeave={leave}>
          {[axisTop, axisTop / 2, 0].map((v) => (
            <i
              key={v}
              className="group-series-grid"
              style={{ top: `${(100 * (1 - v / axisTop)).toFixed(1)}%` }}
            />
          ))}
          {activeMonth !== null && (
            <i
              className="group-series-guide"
              style={{ left: `${xp(activeMonth)}%` }}
              aria-hidden="true"
            />
          )}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {showAll && (
              <path
                d={`M${X(0)},${H} L${linePoints.replace(/ /g, ' L')} L${X(n - 1)},${H} Z`}
                fill="rgba(24,199,221,.12)"
              />
            )}
            {showTogether && (
              <polyline
                points={togetherCounts
                  .map((v, i) => `${X(i)},${Y(v)}`)
                  .join(' ')}
                fill="none"
                stroke="#e6f6f8"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {showAll && (
              <polyline
                points={linePoints}
                fill="none"
                stroke="#18c7dd"
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {showTogether &&
            togetherCounts.map((v, i) => (
              <i
                key={`j${i}`}
                className={`group-series-point2${activeMonth === i ? ' active' : ''}`}
                style={{
                  left: `${xp(i)}%`,
                  top: `${100 * (1 - v / axisTop)}%`,
                }}
              />
            ))}
          {showAll &&
            allCounts.map((v, i) => (
              <span
                key={`t${i}`}
                className={`group-series-point${activeMonth === i ? ' active' : ''}`}
                style={{
                  left: `${xp(i)}%`,
                  top: `${100 * (1 - v / axisTop)}%`,
                }}
              >
                <i />
                <b>{v}</b>
              </span>
            ))}
          {allCounts.map((v, i) => (
            <span
              key={`c${i}`}
              className="group-series-column"
              style={monthColumn(i)}
              tabIndex={0}
              aria-label={`${MONTH_NAMES[monthOf(i)]} de ${yearOf(i)}: ${rosText(v)}, ${togetherCounts[i]} ${togetherLabel.toLocaleLowerCase('pt-BR')}`}
              onPointerEnter={() => focusMonth(i)}
              onFocus={() => focusMonth(i)}
              onBlur={leave}
            />
          ))}
        </div>
        <span />
        <div className="group-series-months">
          {allCounts.map((_, i) => (
            <span
              key={i}
              className={activeMonth === i ? 'active' : undefined}
              style={{ left: `${xp(i)}%` }}
            >
              {MONTH_ABBREVIATIONS[monthOf(i)]}
            </span>
          ))}
        </div>
      </div>
      {bubble}
    </figure>
  )
}
