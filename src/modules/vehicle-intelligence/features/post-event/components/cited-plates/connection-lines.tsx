import { Polyline, Tooltip } from 'react-leaflet'

import { formatElapsedHours } from '@/modules/vehicle-intelligence/features/post-event/components/shared/elapsed-hours'
import { markerScale } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { PoleConnection } from '@/modules/vehicle-intelligence/features/post-event/types'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/** As ligações do polo aberto; tracejadas quando só uma ocorrência liga os polos. */
export function ConnectionLines({
  connections,
  maximum,
  expansion,
}: {
  connections: PoleConnection[]
  maximum: number
  expansion: number
}) {
  return connections.map((connection) => (
    <Polyline
      key={connection.id}
      positions={[
        [connection.origin_latitude, connection.origin_longitude],
        [connection.destination_latitude, connection.destination_longitude],
      ]}
      pathOptions={{
        color: connection.modality === 'ROUBO' ? '#d6404f' : '#c98316',
        weight: 1.5 + 6 * markerScale(connection.occurrences, maximum),
        opacity:
          (0.35 + 0.55 * markerScale(connection.occurrences, maximum)) *
          expansion,
        dashArray: connection.recurrent ? undefined : '4 6',
        lineCap: 'round',
      }}
      className="flow-line"
    >
      <Tooltip sticky>
        {connection.origin_name} → {connection.destination_name} ·{' '}
        {pluralize(connection.occurrences, 'ocorrência', 'ocorrências')} ·{' '}
        {pluralize(connection.vehicles, 'placa', 'placas')} · mediana{' '}
        {formatElapsedHours(connection.median_elapsed_hours, 1)}
      </Tooltip>
    </Polyline>
  ))
}
