import type {
  SlaDashboardFilterIn,
  SlaPerformanceRowOut,
  SlaTicketStatus,
  TicketPriority,
} from '@/http/tickets/get-sla-dashboard'
import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

import {
  DASHBOARD_TATICO_PRIORITY_OPTIONS,
  type DashboardTaticoAdvancedFilterForm,
  emptyDashboardTaticoAdvancedFilters,
  SLA_METRICS_STATUS_OPTIONS,
} from '../../components/filters'

export type SlaMetricsAdvancedFilterForm = DashboardTaticoAdvancedFilterForm

export const SLA_METRICS_PRIORITY_OPTIONS = DASHBOARD_TATICO_PRIORITY_OPTIONS

export { SLA_METRICS_STATUS_OPTIONS }

const priorityLabelByValue = new Map(
  SLA_METRICS_PRIORITY_OPTIONS.map((o) => [o.value, o.label]),
)
const statusLabelByValue = new Map(
  SLA_METRICS_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

export const emptySlaMetricsAdvancedFilters =
  emptyDashboardTaticoAdvancedFilters

export function countSlaMetricsAdvancedFiltersFromApi(
  filters: SlaDashboardFilterIn,
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
  filters: SlaDashboardFilterIn,
): SlaMetricsAdvancedFilterForm {
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
  form: SlaMetricsAdvancedFilterForm,
): Pick<
  SlaDashboardFilterIn,
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
      ? (form.status.map((item) => item.value) as SlaTicketStatus[])
      : undefined,
    tipo_chamado_id: form.tipo_chamado_id.length
      ? form.tipo_chamado_id.map((item) => item.value)
      : undefined,
    relevante_imprensa: form.relevanteImprensa ? true : null,
  }
}

export function stripAdvancedFiltersFromApi(
  filters: SlaDashboardFilterIn,
): SlaDashboardFilterIn {
  const rest = { ...filters }
  delete rest.demandante_id
  delete rest.requisitante
  delete rest.prioridade
  delete rest.status
  delete rest.tipo_chamado_id
  delete rest.relevante_imprensa
  return rest
}

export function formatSlaMetricsAdvancedFiltersSummary(
  filters: SlaDashboardFilterIn,
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

export const SLA_PRIORITY_ROW_LABELS: Record<string, string> = {
  URGENTE: 'Urgente',
  ALTA: 'Alta',
  ROTINA: 'Rotina',
  'SEM PRIORIDADE': 'Sem Prioridade',
  SEM_PRIORIDADE: 'Sem Prioridade',
}

const SLA_PRIORITY_ROW_ORDER = [
  'URGENTE',
  'ALTA',
  'ROTINA',
  'SEM PRIORIDADE',
  'SEM_PRIORIDADE',
] as const

export function sortSlaPerformancePriorityRows(
  rows: SlaPerformanceRowOut[],
): SlaPerformanceRowOut[] {
  const orderIndex = (label: string) => {
    const index = SLA_PRIORITY_ROW_ORDER.indexOf(
      label as (typeof SLA_PRIORITY_ROW_ORDER)[number],
    )
    return index === -1 ? SLA_PRIORITY_ROW_ORDER.length : index
  }

  return [...rows].sort((a, b) => orderIndex(a.label) - orderIndex(b.label))
}

export function formatSlaPerformanceRowLabel(label: string): string {
  return SLA_PRIORITY_ROW_LABELS[label] ?? label
}
