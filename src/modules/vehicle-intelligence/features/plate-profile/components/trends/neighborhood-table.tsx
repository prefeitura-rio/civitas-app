import { formatPercent } from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileNeighborhood } from '@/modules/vehicle-intelligence/types/domain'

const circulationTableLimit = 8

export function NeighborhoodTable({
  neighborhoods,
}: {
  neighborhoods: PlateProfileNeighborhood[]
}) {
  return (
    <div className="profile-loc-table">
      <div className="profile-loc-head neighborhoods">
        <span>#</span>
        <span>Bairro</span>
        <span className="num">Passagens</span>
        <span className="num">Do total</span>
        <span className="num">Pontos ativos</span>
      </div>
      <div className="profile-loc-body">
        {neighborhoods.slice(0, circulationTableLimit).map((item, index) => (
          <div className="profile-loc-row neighborhoods" key={item.name}>
            <span className="profile-rank-index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="profile-loc-name">
              <strong>{item.name}</strong>
            </span>
            <span className="num strong">{formatNumber(item.detections)}</span>
            <span className="num">{formatPercent(item.share)}</span>
            <span className="num">{item.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
