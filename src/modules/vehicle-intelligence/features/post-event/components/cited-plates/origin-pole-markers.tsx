import { CircleMarker, Tooltip } from 'react-leaflet'

import type { PoleMarkerProps } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/pole-marker-props'
import { modalityLabel } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import {
  accessibleMarker,
  markerScale,
} from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { OriginPole } from '@/modules/vehicle-intelligence/features/post-event/types'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/** Polos de roubo e furto; esmaecidos quando nenhuma placa citada foi acompanhada a partir deles. */
export function OriginPoleMarkers({
  poles,
  selectedId,
  hasSelection,
  relatedIds,
  maximum,
  onOpen,
}: PoleMarkerProps & { poles: OriginPole[] }) {
  return poles.map((pole) => {
    const selected = selectedId === pole.id
    const related = !hasSelection || selected || relatedIds.has(pole.id)
    const tracked = pole.tracked_occurrences > 0
    const robbery = pole.modality === 'ROUBO'
    return (
      <CircleMarker
        key={`origin-${pole.id}`}
        center={[pole.latitude, pole.longitude]}
        radius={
          selected
            ? 0.1
            : (tracked ? 6 : 4) + 16 * markerScale(pole.occurrences, maximum)
        }
        pathOptions={{
          color: robbery ? '#8f2934' : '#7a551a',
          fillColor: robbery ? '#e45765' : '#d99a2b',
          weight: tracked ? 2 : 1,
          dashArray: pole.kind === 'concentration' ? '4 3' : undefined,
          fillOpacity: selected ? 0 : !related ? 0.08 : tracked ? 0.74 : 0.2,
          opacity: selected ? 0 : !related ? 0.12 : tracked ? 1 : 0.4,
          className: 'pole-marker',
        }}
        eventHandlers={{
          click: () => onOpen(`origin:${pole.id}`),
          ...accessibleMarker(
            `Polo de ${modalityLabel(pole.modality)} ${pole.name}, ${pole.occurrences} ocorrências`,
            () => onOpen(`origin:${pole.id}`),
          ),
        }}
      >
        <Tooltip
          className="pole-tooltip"
          direction="top"
          offset={[0, -8]}
          opacity={0.98}
        >
          <div>
            <span>
              POLO DE {pole.modality}
              {pole.kind === 'concentration' ? ' · CONCENTRAÇÃO' : ''}
            </span>
            <strong>{pole.name}</strong>
            <small>
              {pluralize(pole.occurrences, 'ocorrência', 'ocorrências')} ·{' '}
              {pluralize(
                pole.tracked_occurrences,
                'com placa citada',
                'com placa citada',
              )}{' '}
              · {pluralize(pole.vehicles, 'placa', 'placas')}
            </small>
            <em>Clique para abrir os pontos e as conexões</em>
          </div>
        </Tooltip>
      </CircleMarker>
    )
  })
}
