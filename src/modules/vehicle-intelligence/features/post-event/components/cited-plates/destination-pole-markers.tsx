import { CircleMarker, Tooltip } from 'react-leaflet'

import type { PoleMarkerProps } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/pole-marker-props'
import {
  accessibleMarker,
  markerScale,
} from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { DestinationPole } from '@/modules/vehicle-intelligence/features/post-event/types'
import {
  formatElapsedHours,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'

export function DestinationPoleMarkers({
  poles,
  selectedId,
  hasSelection,
  relatedIds,
  maximum,
  onOpen,
}: PoleMarkerProps & { poles: DestinationPole[] }) {
  return poles.map((pole) => {
    const selected = selectedId === pole.id
    const related = !hasSelection || selected || relatedIds.has(pole.id)
    return (
      <CircleMarker
        key={`destination-${pole.id}`}
        center={[pole.latitude, pole.longitude]}
        radius={
          selected ? 0.1 : 7 + 18 * markerScale(pole.occurrences, maximum)
        }
        pathOptions={{
          color: '#4c2c69',
          fillColor: '#9b63c1',
          weight: 2,
          dashArray: pole.kind === 'concentration' ? '4 3' : undefined,
          fillOpacity: selected ? 0 : related ? 0.78 : 0.1,
          opacity: selected ? 0 : related ? 1 : 0.12,
        }}
        className="pole-marker"
        eventHandlers={{
          click: () => onOpen(`destination:${pole.id}`),
          ...accessibleMarker(
            `Polo de desconexão ${pole.name}, ${pole.occurrences} ocorrências`,
            () => onOpen(`destination:${pole.id}`),
          ),
        }}
      >
        <Tooltip
          className="pole-tooltip destination"
          direction="top"
          offset={[0, -8]}
          opacity={0.98}
        >
          <div>
            <span>
              POLO DE DESCONEXÃO ·{' '}
              {pole.kind === 'concentration'
                ? 'UM RADAR'
                : pluralize(pole.radar_count, 'RADAR', 'RADARES')}
            </span>
            <strong>{pole.name}</strong>
            <small>
              {pluralize(
                pole.occurrences,
                'ocorrência termina',
                'ocorrências terminam',
              )}{' '}
              aqui · {pluralize(pole.vehicles, 'placa', 'placas')} · mediana{' '}
              {formatElapsedHours(pole.median_elapsed_hours, 1)}
            </small>
            <em>Clique para abrir os radares e as conexões</em>
          </div>
        </Tooltip>
      </CircleMarker>
    )
  })
}
