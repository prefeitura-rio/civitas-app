import { MapPin } from 'lucide-react'

import type { Point } from '@/models/entities'

import { Tooltip } from './tooltip'

export function PossibleStayBadge({
  point,
  stacked = false,
}: {
  stacked?: boolean
  point: Pick<
    Point,
    'possibleStay' | 'stayDurationMinutes' | 'stayDetectionCount'
  >
}) {
  if (!point.possibleStay) return null

  return (
    <div
      className={
        stacked
          ? 'flex justify-center'
          : 'flex flex-wrap items-center justify-start gap-1.5 text-left text-xs'
      }
    >
      <Tooltip
        text={`Possível permanência: ${point.stayDetectionCount ?? 1} ${(point.stayDetectionCount ?? 1) === 1 ? 'detecção' : 'detecções'} no mesmo ponto ou em pontos próximos ao longo de ${point.stayDurationMinutes ?? 0} min. Isso pode indicar permanência na região, mas não confirma que o veículo ficou parado.`}
        asChild
      >
        <button
          type="button"
          aria-label={
            stacked
              ? `Possível permanência: ${point.stayDetectionCount ?? 1} ${(point.stayDetectionCount ?? 1) === 1 ? 'detecção' : 'detecções'}`
              : undefined
          }
          className={
            stacked
              ? 'inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-gray-400/30 bg-gray-400/10 px-2 py-1 text-xs text-muted-foreground'
              : 'inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary'
          }
        >
          <MapPin className="size-3 shrink-0" />
          {stacked ? (
            <>
              <span className="font-semibold tabular-nums">
                {point.stayDetectionCount ?? 1}
              </span>
              <span className="text-[10px]">det.</span>
            </>
          ) : (
            `Possível permanência · ${point.stayDetectionCount ?? 1} ${(point.stayDetectionCount ?? 1) === 1 ? 'detecção' : 'detecções'}`
          )}
        </button>
      </Tooltip>
    </div>
  )
}
