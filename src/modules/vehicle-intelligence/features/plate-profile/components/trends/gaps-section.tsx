import { ArrowRightLeft, LogIn, LogOut, Radar } from 'lucide-react'

import { durationLabel } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import { GapsMap } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/gaps-map'
import { TypicalHourLabel } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/typical-hour-label'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileData } from '@/modules/vehicle-intelligence/types/domain'

export function GapsSection({ gaps }: { gaps: PlateProfileData['hiatos'] }) {
  if (!gaps.count) {
    return (
      <div className="profile-occurrences-empty">
        <Radar size={22} />
        <span>
          Nenhum hiato de {gaps.min_hours} h ou mais foi observado no período.
        </span>
      </div>
    )
  }
  return (
    <div className="profile-gap-wrap">
      <div className="profile-gap-overall">
        <TypicalHourLabel value={gaps.overall.stop_hour} verb="Costuma parar" />
        <TypicalHourLabel
          value={gaps.overall.resume_hour}
          verb="Costuma retomar"
        />
        {gaps.overall.median_gap_seconds !== null && (
          <span className="profile-gap-overall-value">
            Parada mediana de {durationLabel(gaps.overall.median_gap_seconds)}
          </span>
        )}
      </div>
      <div className="profile-gap-tables">
        <div className="profile-gap-table">
          <div className="profile-gap-cap before">
            <LogOut size={15} />
            Último ponto antes da parada
          </div>
          {gaps.before.slice(0, 3).map((item, index) => (
            <div className="profile-gap-row" key={`${item.point_id}-${index}`}>
              <span className="profile-gap-loc">
                <strong>{item.location || item.point_id}</strong>
                <TypicalHourLabel value={item.stop_hour} verb="Para" />
              </span>
              <span className="num strong">{formatNumber(item.hiatos)}</span>
              <span className="num">
                {durationLabel(item.median_gap_seconds)}
              </span>
            </div>
          ))}
        </div>
        <div className="profile-gap-table">
          <div className="profile-gap-cap after">
            <LogIn size={15} />
            Primeiro ponto na retomada
          </div>
          {gaps.after.slice(0, 3).map((item, index) => (
            <div className="profile-gap-row" key={`${item.point_id}-${index}`}>
              <span className="profile-gap-loc">
                <strong>{item.location || item.point_id}</strong>
                <TypicalHourLabel value={item.resume_hour} verb="Retoma" />
              </span>
              <span className="num strong">{formatNumber(item.hiatos)}</span>
              <span className="num">
                {durationLabel(item.median_gap_seconds)}
              </span>
            </div>
          ))}
        </div>
        <div className="profile-gap-table pairs">
          <div className="profile-gap-cap pairs">
            <ArrowRightLeft size={15} />
            Pares recorrentes
          </div>
          {gaps.pairs.slice(0, 3).map((item, index) => (
            <div className="profile-gap-pair-row" key={index}>
              <span className="profile-gap-loc">
                <strong>{item.origin_location || '—'}</strong>
                <small>
                  → {item.dest_location || '—'} ·{' '}
                  {durationLabel(item.median_gap_seconds)}
                </small>
                <span className="profile-gap-pair-hours">
                  <TypicalHourLabel value={item.stop_hour} verb="Antes" />
                  <TypicalHourLabel value={item.resume_hour} verb="Depois" />
                </span>
              </span>
              <span className="num strong">{formatNumber(item.hiatos)}</span>
            </div>
          ))}
        </div>
      </div>
      <GapsMap gaps={gaps} />
    </div>
  )
}
