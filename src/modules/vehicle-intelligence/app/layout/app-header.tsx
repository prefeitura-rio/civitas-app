import { LineChart } from 'lucide-react'

import { RecorteSelector } from '@/modules/vehicle-intelligence/app/layout/recorte-selector'
import { PlateQuickSearch } from '@/modules/vehicle-intelligence/components/plate/plate-quick-search'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { GeneralReportButton } from '@/modules/vehicle-intelligence/features/reports'
import { formatDayRange } from '@/modules/vehicle-intelligence/lib/dates'
import type { OpenPlate } from '@/modules/vehicle-intelligence/types/navigation'

interface AppHeaderProps {
  eyebrow: string
  title: string
  loading: boolean
  period?: {
    start: string
    end: string
  }
  onOpenPlate: OpenPlate
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
              period && `Período: ${formatDayRange(period.start, period.end)}`,
            ]
              .filter(Boolean)
              .join('. ')}
          >
            {recorte.badge && <span>{recorte.badge}</span>}
            {period && <span>{formatDayRange(period.start, period.end)}</span>}
          </span>
        )}
        {recorte.report && <GeneralReportButton />}
        <PlateQuickSearch onOpenPlate={onOpenPlate} />
      </div>
    </header>
  )
}
