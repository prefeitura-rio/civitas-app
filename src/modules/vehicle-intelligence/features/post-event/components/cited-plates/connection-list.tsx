import { modalityLabel } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import { formatElapsedHours } from '@/modules/vehicle-intelligence/features/post-event/components/shared/elapsed-hours'
import type { PoleConnection } from '@/modules/vehicle-intelligence/features/post-event/types'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

export function ConnectionList({
  connections,
  direction,
  onSelect,
}: {
  connections: PoleConnection[]
  direction: 'origin' | 'destination'
  onSelect: (key: string) => void
}) {
  if (!connections.length)
    return (
      <small className="detail-empty">Nenhuma ligação com outro polo.</small>
    )
  return (
    <div className="connection-list">
      {connections.map((connection) => (
        <button
          type="button"
          key={connection.id}
          onClick={() =>
            onSelect(
              direction === 'origin'
                ? `destination:${connection.destination_id}`
                : `origin:${connection.origin_id}`,
            )
          }
        >
          <span>
            {direction === 'origin'
              ? `Desconexão · ${connection.destination_name}`
              : `Polo de ${modalityLabel(connection.modality)} · ${connection.origin_name}`}
          </span>
          <b>{pluralize(connection.occurrences, 'ocorr.', 'ocorr.')}</b>
          <small>
            {pluralize(connection.vehicles, 'placa', 'placas')} · mediana{' '}
            {formatElapsedHours(connection.median_elapsed_hours, 1)} até a
            desconexão
            {connection.recurrent ? '' : ' · ligação única'}
          </small>
        </button>
      ))}
    </div>
  )
}
