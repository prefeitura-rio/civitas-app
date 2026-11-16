import { MapPin } from 'lucide-react'

import type { Point } from '@/models/entities'

import { Tooltip } from './tooltip'

export function PossibleStayBadge({ point }: { point: Point }) {
  if (!point.possibleStay) return null

  return (
    <div className="flex flex-wrap items-center justify-start gap-1.5 text-left text-xs">
      <Tooltip
        text={`Detecções sucessivas no mesmo ponto ou em pontos próximos ao longo de ${point.stayDurationMinutes ?? 0} min. Isso pode indicar permanência na região, mas não confirma que o veículo ficou parado.`}
        asChild
      >
        <button
          type="button"
          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary"
        >
          <MapPin className="size-3 shrink-0" />
          {`Possível permanência · ${point.stayDetectionCount ?? 1} ${(point.stayDetectionCount ?? 1) === 1 ? 'detecção' : 'detecções'}`}
        </button>
      </Tooltip>
    </div>
  )
}
