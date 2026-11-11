import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import type { ReactNode } from 'react'

import { PlateOriginBadge } from '@/modules/vehicle-intelligence/components/plate/plate-origin-badge'
import { PlateQuickSearch } from '@/modules/vehicle-intelligence/components/plate/plate-quick-search'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'
import type { OpenPlate } from '@/modules/vehicle-intelligence/types/navigation'

/** "Zona Sul · Motos" (o selo do recorte sem o ano, que o período já mostra) ou o nome do recorte. */
const RECORTE_LABEL = recorte.badge
  ? recorte.badge.replace(/\s*·\s*\d{4}$/, '')
  : recorte.label

/**
 * Cabeçalho do perfil, único para os três recortes: um cartão fixo no topo com a identidade e as ações na primeira linha e,
 * na segunda, o alternador de análise (`children`) e o período. O fundo do invólucro cobre o conteúdo que rola por trás.
 * A base do cartão fica a 182 px do topo: o índice "Nesta análise" e as âncoras usam 198 px (`.profile-index`, scroll-margin).
 */
export function ProfileTopBar({
  plate,
  vehicle,
  onBack,
  onOpenTimeline,
  period,
  disabled,
  timelineLabel,
  onOpenPlate,
  report,
  children,
}: {
  plate: string
  /** O veículo numa linha (`vehicleLine`); nulo enquanto as correlações carregam. */
  vehicle: string | null
  onBack: () => void
  onOpenTimeline: () => void
  period?: { start: string | null; end: string | null }
  disabled?: boolean
  timelineLabel: string
  onOpenPlate: OpenPlate
  /** O menu dos relatórios em PDF da placa (correlações e tendências), antes da Timeline. */
  report?: ReactNode
  children: ReactNode
}) {
  const hasPeriod =
    typeof period?.start === 'string' &&
    period.start.length > 0 &&
    typeof period.end === 'string' &&
    period.end.length > 0
  return (
    <div className="profile-header">
      <header className="profile-header-card">
        <div className="profile-topbar">
          <button
            type="button"
            className="profile-back"
            onClick={onBack}
            aria-label="Voltar"
            title="Voltar à página anterior"
          >
            <ArrowLeft size={17} />
          </button>
          <i className="profile-topbar-divider" aria-hidden="true" />
          <div className="profile-identity">
            <span className="profile-eyebrow-top">PERFIL DE PLACA</span>
            <span className="profile-identity-line">
              <strong className="profile-plate">{plate}</strong>
              <PlateOriginBadge
                plate={plate}
                className="signal-chip profile-origin"
              />
              {vehicle && (
                <span className="profile-vehicle-line" title={vehicle}>
                  {vehicle}
                </span>
              )}
            </span>
          </div>
          <PlateQuickSearch
            onOpenPlate={onOpenPlate}
            className="profile-search"
            placeholder="Outra placa"
          />
          <div className="profile-topbar-actions">
            {report}
            <button
              type="button"
              className="profile-timeline-cta"
              onClick={onOpenTimeline}
              disabled={disabled}
              title={timelineLabel}
            >
              <Clock size={15} />
              Timeline
            </button>
          </div>
        </div>
        <div className="profile-analysis-row">
          {children}
          <span className="profile-period">
            <Calendar size={14} />
            {hasPeriod && (
              <>
                {formatDate(period!.start!.slice(0, 10))} –{' '}
                {formatDate(period!.end!.slice(0, 10))}
                <i aria-hidden="true" />
              </>
            )}
            {RECORTE_LABEL}
          </span>
        </div>
      </header>
    </div>
  )
}
