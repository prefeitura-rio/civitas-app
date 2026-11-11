import { EventRow } from '@/modules/vehicle-intelligence/features/groups/components/profile/event-row'
import type { GroupEvent } from '@/modules/vehicle-intelligence/types/groups'

/** As ocorrências do grupo em ordem de data; `plates` são as do grupo, destacadas no relato. */
export function EventsTable({
  events,
  colors,
  plates,
  onOpenDay,
}: {
  events: GroupEvent[]
  colors: Record<string, string>
  plates: string[]
  onOpenDay: (day: string) => void
}) {
  return (
    <div
      className="group-table group-table-events scroll"
      role="table"
      aria-label="Ocorrências"
    >
      <div className="group-table-head top" role="row">
        {['Data', 'Local', 'Alvo', 'Placas', 'Evidência', ''].map(
          (title, i) => (
            <span key={i} role="columnheader">
              {title}
            </span>
          ),
        )}
      </div>
      {events.map((groupEvent) => (
        <EventRow
          key={groupEvent.event_id}
          groupEvent={groupEvent}
          colors={colors}
          plates={plates}
          onOpenDay={onOpenDay}
        />
      ))}
    </div>
  )
}
