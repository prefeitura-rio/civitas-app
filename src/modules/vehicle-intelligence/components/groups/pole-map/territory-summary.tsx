import { useMemo } from 'react'

import { PointKindSymbol } from '@/modules/vehicle-intelligence/components/groups/pole-map/point-kind-symbol'
import {
  buildPoles,
  type PoleMapData,
} from '@/modules/vehicle-intelligence/components/groups/pole-map/poles'
import { factionAbbreviation } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import type { PointKind } from '@/modules/vehicle-intelligence/types/groups'

/** A faixa "Parte de · Passa junto por · Desconecta perto de" acima do mapa. */
export function TerritorySummary({ data }: { data: PoleMapData }) {
  const departure = data.territory?.departure[0]
  const disconnection = data.territory?.disconnection[0]
  const passage = useMemo(
    () =>
      buildPoles(data.points, new Set(data.members.map((m) => m.plate)), [
        'passage',
      ])[0],
    [data],
  )
  const cells: Array<{
    kind: PointKind
    label: string
    text: string
    detail: string
  }> = [
    departure
      ? {
          kind: 'departure',
          label: 'Parte de',
          text: `${departure.complex} · ${factionAbbreviation(departure.faction)}`,
          detail: `${departure.count} de ${departure.total} partidas · ${Math.round(departure.lift)}× a taxa das outras ${recorte.groups.items}`,
        }
      : {
          kind: 'departure',
          label: 'Parte de',
          text: 'Sem território acima do comum',
          detail: 'partidas espalhadas',
        },
    passage
      ? {
          kind: 'passage',
          label: 'Passa junto por',
          text: passage.location,
          detail: `${passage.events.length} ${passage.events.length === 1 ? 'RO' : 'ROs'} com 2+ placas nessa câmera`,
        }
      : {
          kind: 'passage',
          label: 'Passa junto por',
          text: '—',
          detail: 'sem passagem junta',
        },
    disconnection
      ? {
          kind: 'disconnection',
          label: 'Desconecta perto de',
          text: `${disconnection.complex} · ${factionAbbreviation(disconnection.faction)}`,
          detail: `${disconnection.count} de ${disconnection.total} desconexões · ${Math.round(disconnection.lift)}× a taxa das outras ${recorte.groups.items}`,
        }
      : {
          kind: 'disconnection',
          label: 'Desconecta perto de',
          text: 'Sem território acima do comum',
          detail: 'desconexões espalhadas',
        },
  ]
  return (
    <div className="group-territory-summary">
      {cells.map((cell) => (
        <div key={cell.kind}>
          <span>
            <PointKindSymbol kind={cell.kind} />
            {cell.label}
          </span>
          <strong>{cell.text}</strong>
          <small>{cell.detail}</small>
        </div>
      ))}
    </div>
  )
}
