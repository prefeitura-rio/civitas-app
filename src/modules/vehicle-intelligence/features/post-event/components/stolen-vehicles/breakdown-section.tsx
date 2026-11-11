import type { BreakdownItem } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { PopupBreakdown } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-breakdown'
import { PopupSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-section'

/** Seção com as barras de porcentagem (CISPs, tipos de veículo). */
export function BreakdownSection({
  title,
  hint,
  items,
}: {
  title: string
  hint: string
  items: BreakdownItem[]
}) {
  return (
    <PopupSection title={title} hint={hint}>
      <div className="radar-popup-breakdown">
        <PopupBreakdown items={items} />
      </div>
    </PopupSection>
  )
}
