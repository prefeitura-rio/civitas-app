import type { CSSProperties } from 'react'

import {
  factionAbbreviation,
  factionColor,
} from '@/modules/vehicle-intelligence/components/map/territories-layer'

/** Quadrado da facção antes do nome do complexo, com a sigla depois (ou sem ela, quando a facção vem por extenso). */
export function ComplexName({
  name,
  faction,
  showAbbreviation = true,
}: {
  name: string
  faction: string | null
  showAbbreviation?: boolean
}) {
  return (
    <span className="group-complex">
      <i
        style={{ background: factionColor(faction) } as CSSProperties}
        aria-hidden="true"
      />
      <span className="group-complex-name">{name}</span>
      {showAbbreviation && faction && (
        <span className="group-complex-abbr">
          {factionAbbreviation(faction)}
        </span>
      )}
    </span>
  )
}
