import type {
  DemandVolumeFilterIn,
  TicketPriority,
  TicketStatus,
} from '@/http/tickets/get-demand-volume'
import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

import {
  DASHBOARD_TATICO_PRIORITY_OPTIONS,
  type DashboardTaticoAdvancedFilterForm,
  DEMAND_VOLUME_STATUS_OPTIONS,
  emptyDashboardTaticoAdvancedFilters,
} from '../../components/filters'

export type DemandVolumeAdvancedFilterForm = DashboardTaticoAdvancedFilterForm

export const DEMAND_VOLUME_PRIORITY_OPTIONS = DASHBOARD_TATICO_PRIORITY_OPTIONS

export { DEMAND_VOLUME_STATUS_OPTIONS }

const priorityLabelByValue = new Map(
  DEMAND_VOLUME_PRIORITY_OPTIONS.map((o) => [o.value, o.label]),
)
const statusLabelByValue = new Map(
  DEMAND_VOLUME_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

export const emptyDemandVolumeAdvancedFilters =
  emptyDashboardTaticoAdvancedFilters

export function countDemandVolumeAdvancedFilters(
  form: DemandVolumeAdvancedFilterForm,
): number {
  let count = 0
  count += form.demandante_id.length
  count += form.requisitante.length
  count += form.prioridade.length
  count += form.status.length
  count += form.tipo_chamado_id.length
  if (form.relevanteImprensa) count += 1
  return count
}

export function countDemandVolumeAdvancedFiltersFromApi(
  filters: DemandVolumeFilterIn,
): number {
  let count = 0
  count += filters.demandante_id?.length ?? 0
  count += filters.requisitante?.length ?? 0
  count += filters.prioridade?.length ?? 0
  count += filters.status?.length ?? 0
  count += filters.tipo_chamado_id?.length ?? 0
  if (filters.relevante_imprensa === true) {
    count += 1
  }
  return count
}

function toSearchOptions(
  values: string[] | undefined,
  labelMap: Map<string, string>,
): SearchOption[] {
  if (!values?.length) return []
  return values.map((value) => ({
    value,
    label: labelMap.get(value) ?? value,
  }))
}

export function advancedFiltersFromApi(
  filters: DemandVolumeFilterIn,
): DemandVolumeAdvancedFilterForm {
  return {
    demandante_id: (filters.demandante_id ?? []).map((value) => ({
      value,
      label: value,
    })),
    requisitante: (filters.requisitante ?? []).map((value) => ({
      value,
      label: value,
    })),
    prioridade: toSearchOptions(
      filters.prioridade,
      priorityLabelByValue,
    ) as SearchOption[],
    status: toSearchOptions(
      filters.status,
      statusLabelByValue,
    ) as SearchOption[],
    tipo_chamado_id: (filters.tipo_chamado_id ?? []).map((value) => ({
      value,
      label: value,
    })),
    relevanteImprensa: filters.relevante_imprensa === true,
  }
}

export function advancedFiltersToApiPatch(
  form: DemandVolumeAdvancedFilterForm,
): Pick<
  DemandVolumeFilterIn,
  | 'demandante_id'
  | 'requisitante'
  | 'prioridade'
  | 'status'
  | 'tipo_chamado_id'
  | 'relevante_imprensa'
> {
  return {
    demandante_id: form.demandante_id.length
      ? form.demandante_id.map((item) => item.value)
      : undefined,
    requisitante: form.requisitante.length
      ? form.requisitante.map((item) => item.value)
      : undefined,
    prioridade: form.prioridade.length
      ? (form.prioridade.map((item) => item.value) as TicketPriority[])
      : undefined,
    status: form.status.length
      ? (form.status.map((item) => item.value) as TicketStatus[])
      : undefined,
    tipo_chamado_id: form.tipo_chamado_id.length
      ? form.tipo_chamado_id.map((item) => item.value)
      : undefined,
    relevante_imprensa: form.relevanteImprensa ? true : null,
  }
}

export function stripAdvancedFiltersFromApi(
  filters: DemandVolumeFilterIn,
): DemandVolumeFilterIn {
  const rest = { ...filters }
  delete rest.demandante_id
  delete rest.requisitante
  delete rest.prioridade
  delete rest.status
  delete rest.tipo_chamado_id
  delete rest.relevante_imprensa
  return rest
}

export function formatDemandVolumeAdvancedFiltersSummary(
  filters: DemandVolumeFilterIn,
): string[] {
  const lines: string[] = []
  if (filters.demandante_id?.length) {
    lines.push(`Demandante: ${filters.demandante_id.length} selecionado(s)`)
  }
  if (filters.requisitante?.length) {
    lines.push(`Requisitante: ${filters.requisitante.join(', ')}`)
  }
  if (filters.prioridade?.length) {
    const labels = filters.prioridade.map(
      (p) => priorityLabelByValue.get(p) ?? p,
    )
    lines.push(`Urgência: ${labels.join(', ')}`)
  }
  if (filters.status?.length) {
    const labels = filters.status.map((s) => statusLabelByValue.get(s) ?? s)
    lines.push(`Status: ${labels.join(', ')}`)
  }
  if (filters.tipo_chamado_id?.length) {
    lines.push(
      `Tipo de chamado: ${filters.tipo_chamado_id.length} selecionado(s)`,
    )
  }
  if (filters.relevante_imprensa === true) {
    lines.push('Relevante para imprensa: Sim')
  }
  return lines
}
