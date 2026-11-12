import type { Dispatch, RefObject, SetStateAction } from 'react'

import type {
  EventKind,
  GroupEvent,
} from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { SequenceRow } from '@/modules/vehicle-intelligence/components/timeline/group/sequence-row'
import { formatDayMonth } from '@/modules/vehicle-intelligence/lib/dates'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/** A sequência do dia do grupo, à direita: tudo ou só juntas, fatos e marcas; a linha ativa rola para a vista. */
export function GroupSequencePanel({
  selectedDay,
  events,
  activeIndex,
  listFilter,
  setListFilter,
  listRef,
  colors,
  factLabels,
  goTo,
}: {
  selectedDay: string
  events: GroupEvent[]
  activeIndex: number
  listFilter: 'all' | 'marks'
  setListFilter: Dispatch<SetStateAction<'all' | 'marks'>>
  listRef: RefObject<HTMLDivElement>
  colors: Map<string, string>
  factLabels: Map<string, string>
  goTo: (e: GroupEvent) => void
}) {
  const MARK_KINDS = new Set<EventKind>([
    'fact',
    'together',
    'departure',
    'disconnection',
  ])
  const rows = events
    .map((e, k) => ({ e, k }))
    .filter(({ e }) => listFilter === 'all' || MARK_KINDS.has(e.kind))
  return (
    <aside className="gt-list-panel">
      <header>
        <div className="gt-list-top">
          <div>
            <strong>Sequência do dia</strong>
            <span>
              {formatDayMonth(selectedDay)} ·{' '}
              {pluralize(events.length, 'evento', 'eventos')}
            </span>
          </div>
          <span className="gt-counter">
            {Math.max(0, activeIndex + 1)} / {events.length}
          </span>
        </div>
        <div
          className="gt-segments wide"
          role="group"
          aria-label="O que a lista mostra"
        >
          {(
            [
              ['all', 'Tudo'],
              ['marks', 'Juntas, fatos e marcas'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={listFilter === value}
              className={listFilter === value ? 'active' : ''}
              onClick={() => setListFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <div className="gt-list" ref={listRef}>
        {rows.map(({ e, k }) => (
          <SequenceRow
            key={e.key}
            item={e}
            active={k === activeIndex}
            future={k > activeIndex}
            colors={colors}
            factLabels={factLabels}
            onClick={() => goTo(e)}
          />
        ))}
      </div>
    </aside>
  )
}
