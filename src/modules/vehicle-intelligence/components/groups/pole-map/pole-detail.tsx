import { ArrowLeft } from 'lucide-react'

import { PointKindSymbol } from '@/modules/vehicle-intelligence/components/groups/pole-map/point-kind-symbol'
import {
  hourRange,
  POINT_KINDS,
  type Pole,
} from '@/modules/vehicle-intelligence/components/groups/pole-map/poles'
import { factionAbbreviation } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import {
  formatDayMonthYear,
  formatTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { shortAddress } from '@/modules/vehicle-intelligence/lib/labels'
import type { GroupEvent } from '@/modules/vehicle-intelligence/types/groups'

/** O polo aberto: tipo, local e complexo perto, os números, as placas e os ROs ligados a ele. */
export function PoleDetail({
  pole,
  eventsById,
  colors,
  onBack,
}: {
  pole: Pole
  eventsById: Map<string, GroupEvent>
  colors: Record<string, string>
  onBack: () => void
}) {
  const kindInfo = POINT_KINDS[pole.kind]
  const maximum = Math.max(...pole.plates.map(([, n]) => n))
  const poleEvents = pole.events
    .map((id) => eventsById.get(id))
    .filter((e): e is GroupEvent => Boolean(e))
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
  return (
    <div className="group-pole-detail">
      <button type="button" className="group-back small" onClick={onBack}>
        <ArrowLeft size={14} />
        Todos os polos
      </button>
      <div className="group-pole-title">
        <span style={{ color: kindInfo.textColor }}>
          <PointKindSymbol kind={pole.kind} />
          {kindInfo.name}
        </span>
        <strong>{pole.location}</strong>
        <small>
          {pole.complex
            ? `perto de ${pole.complex}${pole.faction ? ` (${factionAbbreviation(pole.faction)})` : ''}, ${formatNumber(pole.distance)} m`
            : 'fora de território mapeado'}
        </small>
      </div>
      <div className="group-pole-numbers">
        <span>
          <b>{pole.count}</b>
          <small>leituras</small>
        </span>
        <span>
          <b>{pole.plates.length}</b>
          <small>{pole.plates.length === 1 ? 'placa' : 'placas'}</small>
        </span>
        <span>
          <b>{pole.events.length}</b>
          <small>ROs</small>
        </span>
      </div>
      <p>
        {pole.count} de {pole.total} {kindInfo.plural.toLowerCase()} do grupo,{' '}
        {hourRange(pole.hours)}.
      </p>
      <div>
        <h3>Placas</h3>
        {pole.plates.map(([plate, n]) => (
          <div key={plate} className="group-pole-plate">
            <span className="group-plate">
              <i style={{ background: colors[plate] }} aria-hidden="true" />
              {plate}
            </span>
            <i className="group-bar" aria-hidden="true">
              <i
                style={{
                  width: `${(100 * n) / maximum}%`,
                  background: colors[plate],
                }}
              />
            </i>
            <b>{n}</b>
          </div>
        ))}
      </div>
      <div>
        <h3>ROs ligados a este polo</h3>
        {poleEvents.map((groupEvent) => (
          <div key={groupEvent.event_id} className="group-pole-ro">
            <span>
              <span className="light">
                {formatDayMonthYear(groupEvent.occurred_at)}
              </span>{' '}
              <span className="dim">{formatTime(groupEvent.occurred_at)}</span>{' '}
              <span>
                ·{' '}
                {pole.items
                  .filter((item) => item.event_id === groupEvent.event_id)
                  .map((item) => item.plate)
                  .join(', ')}
              </span>
            </span>
            <small>{shortAddress(groupEvent.address)}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
