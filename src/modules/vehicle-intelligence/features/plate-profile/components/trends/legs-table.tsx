import { ArrowRight } from 'lucide-react'

import { durationLabel } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileTripLeg } from '@/modules/vehicle-intelligence/types/domain'

const tripTableLimit = 6

export function LegsTable({ legs }: { legs: PlateProfileTripLeg[] }) {
  return (
    <div className="profile-loc-table">
      <div className="profile-loc-head legs">
        <span>#</span>
        <span>Origem</span>
        <span />
        <span>Destino</span>
        <span className="num">Viagens</span>
        <span className="num">Tempo mediano</span>
      </div>
      <div className="profile-loc-body">
        {legs.slice(0, tripTableLimit).map((leg, index) => (
          <div
            className="profile-loc-row legs"
            key={`${leg.origin_point_id}-${leg.dest_point_id}-${index}`}
          >
            <span className="profile-rank-index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="profile-loc-name">
              <strong>{leg.origin_location || leg.origin_point_id}</strong>
              <small>{leg.origin_neighborhood || '—'}</small>
            </span>
            <ArrowRight size={15} className="profile-loc-arrow" />
            <span className="profile-loc-name">
              <strong>{leg.dest_location || leg.dest_point_id}</strong>
              <small>{leg.dest_neighborhood || '—'}</small>
            </span>
            <span className="num strong">{formatNumber(leg.count)}</span>
            <span className="num">{durationLabel(leg.median_gap_seconds)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
