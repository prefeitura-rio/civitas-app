import { useRef, useState } from 'react'

import { EventList } from '@/modules/vehicle-intelligence/components/groups/trends/event-list'
import {
  factsText,
  hourRange,
  shareOfTotal,
} from '@/modules/vehicle-intelligence/components/groups/trends/trend-text'
import type { TrendsData } from '@/modules/vehicle-intelligence/components/groups/trends/trends-data'
import {
  interactive,
  useTooltip,
} from '@/modules/vehicle-intelligence/components/groups/trends/use-tooltip'
import { formatDayMonth } from '@/modules/vehicle-intelligence/lib/dates'
import { cispLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** As delegacias com mais ROs; o balão traz os juntos, a hora mais comum, as datas e os ROs. */
export function PoliceStations({
  data,
  togetherLabel,
}: {
  data: TrendsData
  togetherLabel: string
}) {
  const area = useRef<HTMLDivElement>(null)
  const { show, hide, bubble } = useTooltip(area)
  const [activeCisp, setActiveCisp] = useState<string | null>(null)
  const items = data.trends?.cisps ?? []
  const maximum = Math.max(1, ...items.map((item) => item.events))
  const total = data.events.length
  const leave = () => {
    setActiveCisp(null)
    hide()
  }
  const rowProps = (item: (typeof items)[number]) =>
    interactive(
      (target) => {
        setActiveCisp(item.cisp)
        const cispEvents = data.events.filter(
          (groupEvent) => groupEvent.cisp === item.cisp,
        )
        const togetherCount = cispEvents.filter(
          (groupEvent) => groupEvent.plates.length >= 2,
        ).length
        const days = cispEvents.map((groupEvent) => groupEvent.day).sort()
        const hourCounts = Array<number>(24).fill(0)
        cispEvents.forEach((groupEvent) => {
          hourCounts[groupEvent.hour] += 1
        })
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
        // À esquerda da linha, para não cobrir as delegacias de baixo; sem espaço (tela estreita), acima ou abaixo dela.
        const box = area.current?.getBoundingClientRect()
        const rowBox = target.getBoundingClientRect()
        const sideAnchor =
          box && box.left > 320
            ? { x: -8, y: rowBox.top - box.top, side: 'left' as const }
            : undefined
        show(
          target,
          <>
            <strong className="group-tip-title">
              {cispLabel(item.cisp, item.name)}
            </strong>
            <span className="group-tip-row">
              <b>{factsText(item.events)}</b>
              <em>{shareOfTotal(item.events, total)}</em>
            </span>
            {cispEvents.length > 0 && (
              <>
                <span className="group-tip-note">
                  {togetherCount} {togetherLabel.toLocaleLowerCase('pt-BR')} ·
                  hora mais comum {hourRange(peakHour)}
                </span>
                <span className="group-tip-note">
                  De {formatDayMonth(days[0])} a{' '}
                  {formatDayMonth(days[days.length - 1])}
                </span>
              </>
            )}
            <EventList events={cispEvents} />
          </>,
          sideAnchor,
        )
      },
      leave,
      `${cispLabel(item.cisp, item.name)}: ${factsText(item.events)}`,
    )
  return (
    <div className="group-stations" ref={area}>
      <h3>Delegacias</h3>
      {items.map((item) => (
        <div
          key={item.cisp}
          className={activeCisp === item.cisp ? 'active' : undefined}
          {...rowProps(item)}
        >
          <span>{cispLabel(item.cisp, item.name)}</span>
          <b>{item.events}</b>
          <i className="group-bar" aria-hidden="true">
            <i style={{ width: `${(100 * item.events) / maximum}%` }} />
          </i>
        </div>
      ))}
      {bubble}
    </div>
  )
}
