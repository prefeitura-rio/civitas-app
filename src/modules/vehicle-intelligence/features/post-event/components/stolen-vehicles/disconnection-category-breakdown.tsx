import { PopupSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-section'
import {
  PRIMARY,
  SECONDARY,
  TEXT,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { LocationHotspot } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** Carga: o polo de desconexão reúne as duas categorias; o motor conta cada uma. */
export function DisconnectionCategoryBreakdown({
  counts,
}: {
  counts: LocationHotspot['category_counts']
}) {
  if (!counts) return null
  return (
    <PopupSection title="Desconexões por categoria" hint={TEXT.unit}>
      <div className="radar-popup-metrics">
        {[PRIMARY, SECONDARY].map((modality) => (
          <span key={modality}>
            <b>{formatNumber(counts[modality] ?? 0)}</b>
            {categoryLabel(modality)}
          </span>
        ))}
      </div>
    </PopupSection>
  )
}
