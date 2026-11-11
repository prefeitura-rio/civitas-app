import { formatElapsedHours } from '@/modules/vehicle-intelligence/features/post-event/components/shared/elapsed-hours'
import { modalityName } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { ClusterConnection } from '@/modules/vehicle-intelligence/features/post-event/types'

export function ClusterConnections({
  connections,
  direction,
}: {
  connections: ClusterConnection[]
  direction: 'origin' | 'destination'
}) {
  if (!connections.length)
    return <small>Sem ligação entre polos no recorte atual.</small>
  return (
    <div className="cluster-connection-list">
      {connections.map((connection) => (
        <div key={connection.id}>
          <span>
            {direction === 'origin'
              ? `Polo de desconexão · ${connection.destination_cluster_name}`
              : `Polo de ${modalityName(connection.modality)} · ${connection.origin_cluster_name}`}
          </span>
          <b>{connection.occurrences} ocorr.</b>
          <small>
            conexão recorrente · mediana{' '}
            {formatElapsedHours(connection.median_elapsed_hours)}
          </small>
        </div>
      ))}
    </div>
  )
}
