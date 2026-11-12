import type { CSSProperties } from 'react'

import { POINT_KINDS } from '@/modules/vehicle-intelligence/components/groups/pole-map/poles'
import type { PointKind } from '@/modules/vehicle-intelligence/types/groups'

/** Símbolo do tipo: círculo cheio (partida), quadrado (passagem junta) ou anel (desconexão). */
export function PointKindSymbol({
  kind,
  size = 11,
}: {
  kind: PointKind
  size?: number
}) {
  const color = POINT_KINDS[kind].uiColor
  const style: CSSProperties =
    kind === 'disconnection'
      ? {
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid ${color}`,
        }
      : {
          width: size,
          height: size,
          borderRadius: kind === 'passage' ? 3 : '50%',
          background: color,
        }
  return <i className="group-symbol" style={style} aria-hidden="true" />
}
