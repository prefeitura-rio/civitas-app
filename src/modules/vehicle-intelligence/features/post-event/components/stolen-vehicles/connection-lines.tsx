import { Polyline, Tooltip } from 'react-leaflet'

import {
  clusterConnectionOpacity,
  clusterConnectionWeight,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { PRIMARY } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { ClusterConnection } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatElapsedHours } from '@/modules/vehicle-intelligence/lib/format'

/** As conexões recorrentes do polo aberto, em linha reta (não são rota viária). */
export function ConnectionLines({
  connections,
  maximum,
}: {
  connections: ClusterConnection[]
  maximum: number
}) {
  return connections.map((connection) => (
    <Polyline
      key={connection.id}
      positions={[
        [connection.origin_latitude, connection.origin_longitude],
        [connection.destination_latitude, connection.destination_longitude],
      ]}
      pathOptions={{
        color: connection.modality === PRIMARY ? '#e45765' : '#d99a2b',
        weight: clusterConnectionWeight(connection.occurrences, maximum),
        opacity: clusterConnectionOpacity(connection.occurrences, maximum),
        lineCap: 'round',
        className: 'cluster-flow-line',
      }}
    >
      <Tooltip>
        {connection.occurrences} ocorrências conectadas · mediana{' '}
        {formatElapsedHours(connection.median_elapsed_hours)} até a última
        detecção
      </Tooltip>
    </Polyline>
  ))
}
