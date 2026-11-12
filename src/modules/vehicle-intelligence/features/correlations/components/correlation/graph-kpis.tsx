import { SCREEN } from '@/modules/vehicle-intelligence/features/correlations/screen-variants'
import type { MasterPreData } from '@/modules/vehicle-intelligence/types/domain'

/** Os quatro indicadores do grafo, que mudam por estratégia (SCREEN.kpis). */
export function GraphKpis({ data }: { data: MasterPreData }) {
  return (
    <div className="mini-kpi-grid">
      {SCREEN.kpis(data).map(({ label, value, icon: Icon }) => (
        <article key={label}>
          <Icon />
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  )
}
