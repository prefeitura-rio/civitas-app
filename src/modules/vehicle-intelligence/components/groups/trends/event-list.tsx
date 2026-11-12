import { rosText } from '@/modules/vehicle-intelligence/components/groups/trends/trend-text'
import { formatInBrasilia } from '@/modules/vehicle-intelligence/lib/dates'
import { cispLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type { GroupEvent } from '@/modules/vehicle-intelligence/types/groups'

/** ROs listados no balão; o resto vira "e mais N". */
const MAX_LISTED_EVENTS = 4

/** Os ROs de um recorte do balão: data e hora, delegacia e placas do grupo no RO. */
export function EventList({ events }: { events: GroupEvent[] }) {
  if (!events.length) return null
  const sorted = [...events].sort((a, b) =>
    a.occurred_at.localeCompare(b.occurred_at),
  )
  return (
    <ul className="group-tip-ros">
      {sorted.slice(0, MAX_LISTED_EVENTS).map((groupEvent) => (
        <li key={groupEvent.event_id}>
          <b>
            {formatInBrasilia(groupEvent.occurred_at, {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </b>
          <span>
            {cispLabel(groupEvent.cisp, groupEvent.cisp_name)} ·{' '}
            {groupEvent.plates.length}{' '}
            {groupEvent.plates.length === 1 ? 'placa' : 'placas'}
          </span>
        </li>
      ))}
      {sorted.length > MAX_LISTED_EVENTS && (
        <li className="group-tip-more">
          e mais {rosText(sorted.length - MAX_LISTED_EVENTS)}
        </li>
      )}
    </ul>
  )
}
