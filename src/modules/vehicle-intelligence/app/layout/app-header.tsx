import { LineChart } from 'lucide-react'

import { RecorteSelector } from '@/modules/vehicle-intelligence/app/layout/recorte-selector'
import { PlateQuickSearch } from '@/modules/vehicle-intelligence/components/plate/plate-quick-search'
import type { OpenSearchedPlate } from '@/modules/vehicle-intelligence/components/plate/plate-search'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { GeneralReportButton } from '@/modules/vehicle-intelligence/features/reports'

interface AppHeaderProps {
  eyebrow: string
  title: string
  loading: boolean
  period?: {
    start: string
    end: string
  }
  onOpenPlate: OpenSearchedPlate
}

/** "02/01 – 30/09/2026" (o ano do início só aparece quando difere do fim). */
function formatPeriod(start: string, end: string): string {
  const [y1, m1, d1] = start.split('-')
  const [y2, m2, d2] = end.split('-')
  return `${d1}/${m1}${y1 === y2 ? '' : `/${y1}`} – ${d2}/${m2}/${y2}`
}

// A navegação entre as telas do módulo fica no sidebar do CIVITAS (Veículos → Inteligência Veicular).
export function AppHeader({
  eyebrow,
  title,
  loading,
  period,
  onOpenPlate,
}: AppHeaderProps) {
  return (
    <header className="topbar">
      <span className="sr-only" role="status" aria-live="polite">
        {loading ? 'Atualizando visão' : 'Visão atualizada'}
      </span>
      <div className="topbar-heading">
        <div className="page-title">
          <div className="title-icon">
            <LineChart size={21} />
          </div>
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
          </div>
        </div>
      </div>
      <div className="topbar-actions">
        <RecorteSelector />
        {(recorte.badge || period) && (
          <span
            className="topbar-scope"
            aria-label={[
              recorte.badge && `Base: ${recorte.badge}`,
              period && `Período: ${formatPeriod(period.start, period.end)}`,
            ]
              .filter(Boolean)
              .join('. ')}
          >
            {recorte.badge && <span>{recorte.badge}</span>}
            {period && <span>{formatPeriod(period.start, period.end)}</span>}
          </span>
        )}
        {recorte.report && <GeneralReportButton />}
        <PlateQuickSearch onOpenPlate={onOpenPlate} />
      </div>
    </header>
  )
}
