import { MapPin, Radar, Sunrise } from 'lucide-react'
import { useMemo } from 'react'

import {
  Card,
  CardContent,
} from '@/modules/vehicle-intelligence/components/ui/card'
import { formatPercent } from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'
import {
  shiftMeta,
  weekdayLong,
} from '@/modules/vehicle-intelligence/features/plate-profile/shifts'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileData } from '@/modules/vehicle-intelligence/types/domain'

function weekdayNameLower(index: number | null): string {
  return index === null || index < 0 || index > 6
    ? '—'
    : weekdayLong[index].toLowerCase()
}

/** Os três destaques do topo das tendências: rotina predominante, base de circulação e volume observado. */
export function TrendsKpis({
  summary,
}: {
  summary: PlateProfileData['summary']
}) {
  const heroKpis = useMemo(() => {
    if (!summary) return []
    const shift = summary.predominant_shift
      ? shiftMeta[summary.predominant_shift]
      : null
    return [
      {
        label: 'Rotina predominante',
        value: shift ? shift.label : '—',
        meta: shift
          ? `${shift.window} concentra ${formatPercent(summary.predominant_shift_share)}${summary.top_weekday !== null ? ` · pico ${weekdayNameLower(summary.top_weekday)}` : ''}`
          : '—',
        icon: Sunrise,
        highlight: true,
      },
      {
        label: 'Base de circulação',
        value: summary.top_neighborhood || '—',
        meta: summary.top_location
          ? `${summary.top_location} · ${formatNumber(summary.top_location_detections)} passagens (${formatPercent(summary.top_location_share)})`
          : '—',
        icon: MapPin,
      },
      {
        label: 'Volume observado',
        value: formatNumber(summary.total_detections),
        meta: `${formatNumber(summary.active_days)} dias ativos · média de ${formatNumber(summary.avg_detections_active_day)} por dia`,
        icon: Radar,
      },
    ]
  }, [summary])
  return (
    <section className="profile-kpis-lead" aria-label="Resumo da rotina">
      {heroKpis.map(({ label, value, meta, icon: Icon, highlight }) => (
        <Card
          key={label}
          className={
            highlight ? 'profile-kpi-lead highlight' : 'profile-kpi-lead'
          }
        >
          <CardContent className="profile-kpi-lead-content">
            <div className="profile-kpi-lead-icon">
              <Icon size={19} />
            </div>
            <div className="profile-kpi-lead-copy">
              <span>{label}</span>
              <strong title={value}>{value}</strong>
              <small>{meta}</small>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
