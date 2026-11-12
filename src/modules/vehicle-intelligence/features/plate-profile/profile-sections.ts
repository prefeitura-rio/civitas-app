/** As seções de cada análise no índice "Nesta análise" (os ids são as âncoras da página) e o número ao lado de cada uma. */
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import type { ProfileIndicator } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/use-profile-indicators'
import { eachDay } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import { shiftOrder } from '@/modules/vehicle-intelligence/features/plate-profile/shifts'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import type {
  PlateCorrelationsData,
  PlateProfileData,
} from '@/modules/vehicle-intelligence/types/domain'

export type SectionId =
  | 'onde-circula'
  | 'quando-circula'
  | 'recorrencia'
  | 'rotina-semanal'
  | 'turnos'
  | 'hiatos'
  | 'rotina-parecida'

export const SECTION_DEFS: Array<{ id: SectionId; label: string }> = [
  { id: 'onde-circula', label: 'Onde circula' },
  { id: 'quando-circula', label: 'Dia a dia' },
  { id: 'recorrencia', label: 'Recorrência' },
  { id: 'rotina-semanal', label: 'Rotina semanal' },
  { id: 'turnos', label: 'Turnos do dia' },
  { id: 'hiatos', label: 'Para e retoma' },
  // Assinatura de rotina: só o recorte com grupos (motos, entorno do fato) tem a camada.
  ...(recorte.groups.hasRoutine
    ? [{ id: 'rotina-parecida' as const, label: 'Rotina parecida' }]
    : []),
]

export type CorrelationSectionId = 'corr-resumo' | 'corr-timeline' | 'corr-mapa'

export const CORRELATION_SECTION_DEFS: Array<{
  id: CorrelationSectionId
  label: string
}> = [
  { id: 'corr-resumo', label: 'Resumo' },
  { id: 'corr-timeline', label: 'Ocorrências ligadas' },
  { id: 'corr-mapa', label: 'Geografia' },
]

export function correlationSectionBadge(
  id: CorrelationSectionId,
  data: PlateCorrelationsData,
  indicators: ProfileIndicator[],
): string {
  switch (id) {
    case 'corr-resumo':
      return indicators.length
        ? pluralize(indicators.length, 'indicador', 'indicadores')
        : ''
    case 'corr-timeline':
      return formatNumber(data.summary.linked_events)
    case 'corr-mapa':
      return formatNumber(
        data.occurrences.filter((item) => item.role === 'candidate').length,
      )
  }
}

export function sectionBadge(id: SectionId, data: PlateProfileData): string {
  switch (id) {
    case 'onde-circula':
      return formatNumber(data.top_locations.length)
    case 'quando-circula':
      return formatNumber(
        data.period.start && data.period.end
          ? eachDay(data.period.start, data.period.end).length
          : data.summary.active_days,
      )
    case 'recorrencia':
      return formatNumber(Math.min(6, data.top_locations.length))
    case 'rotina-semanal':
      return ''
    case 'turnos':
      return formatNumber(shiftOrder.length)
    case 'hiatos':
      return formatNumber(data.hiatos.count)
    default:
      return ''
  }
}
