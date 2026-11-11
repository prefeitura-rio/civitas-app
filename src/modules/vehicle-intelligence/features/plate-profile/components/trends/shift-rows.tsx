import type { LucideIcon } from 'lucide-react'
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react'

import { formatPercent } from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'
import {
  type ShiftKey,
  shiftMeta,
  shiftOrder,
} from '@/modules/vehicle-intelligence/features/plate-profile/shifts'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileData } from '@/modules/vehicle-intelligence/types/domain'

const shiftVisual: Record<ShiftKey, { icon: LucideIcon; color: string }> = {
  madrugada: { icon: Moon, color: '#3f6b7a' },
  manha: { icon: Sunrise, color: 'linear-gradient(90deg,#00b4e8,#20d6ff)' },
  tarde: { icon: Sun, color: 'linear-gradient(90deg,#0d8fb8,#20d6ff)' },
  noite: { icon: Sunset, color: '#2f7f96' },
}

export function ShiftRows({
  totals,
  profiles,
  predominant,
}: {
  totals: PlateProfileData['shift_totals']
  profiles: PlateProfileData['shift_profiles']
  predominant: ShiftKey | null
}) {
  const max = Math.max(1, ...Object.values(totals))
  const grandTotal = Math.max(
    1,
    Object.values(totals).reduce((sum, value) => sum + value, 0),
  )
  return (
    <div className="profile-shift-rows">
      {shiftOrder.map((key) => {
        const count = totals[key]
        const Icon = shiftVisual[key].icon
        const topLabel =
          [profiles[key].neighborhood, profiles[key].location]
            .filter(Boolean)
            .join(' · ') || 'Sem local dominante'
        return (
          <div
            className={`profile-shift-row${key === predominant ? ' active' : ''}`}
            key={key}
          >
            <div className="profile-shift-row-icon">
              <Icon size={17} />
            </div>
            <div className="profile-shift-row-main">
              <div>
                <strong>{shiftMeta[key].label}</strong>
                <span>{shiftMeta[key].window}</span>
                <em>{topLabel}</em>
              </div>
              <i>
                <b
                  style={{
                    width: `${Math.round((100 * count) / max)}%`,
                    background: shiftVisual[key].color,
                  }}
                />
              </i>
            </div>
            <div className="profile-shift-row-total">
              <strong>{formatNumber(count)}</strong>
              <span>{formatPercent((100 * count) / grandTotal)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
