import { useState } from 'react'

import { OccurrenceDynamicsPanel } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** Relatos só são buscados quando o analista abre a seção. */
export function LazyDynamics({
  eventIds,
  plates,
}: {
  eventIds: string[]
  plates: string[]
}) {
  const [open, setOpen] = useState(false)
  const shown = eventIds.slice(0, 60)
  if (!eventIds.length) return null
  return (
    <details
      className="detail-dynamics"
      onToggle={(event) =>
        setOpen((event.currentTarget as HTMLDetailsElement).open)
      }
    >
      <summary>
        Ler os relatos ({formatNumber(eventIds.length)}
        {eventIds.length > shown.length ? `, primeiros ${shown.length}` : ''})
      </summary>
      {open && (
        <OccurrenceDynamicsPanel
          eventIds={shown}
          highlight={plates.map((plate) => plate.toLowerCase())}
        />
      )}
    </details>
  )
}
