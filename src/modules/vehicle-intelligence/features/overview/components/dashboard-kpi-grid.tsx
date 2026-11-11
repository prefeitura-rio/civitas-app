import { StatCard } from '@/modules/vehicle-intelligence/components/stat-card'
import { OVERVIEW } from '@/modules/vehicle-intelligence/features/overview/overview-variants'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

export function DashboardKpiGrid({ data }: { data: DashboardData }) {
  return (
    <section
      className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 min-[1181px]:grid-cols-4"
      aria-label="Indicadores principais"
    >
      {OVERVIEW.kpis(data).map(({ label, value, meta, icon }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          meta={meta}
          icon={icon}
        />
      ))}
    </section>
  )
}
