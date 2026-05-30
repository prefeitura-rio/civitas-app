import type {
  OperationalViewFilterIn,
  OperationalViewPriority,
  OperationalViewStatus,
} from '@/http/tickets/get-operational-view'
import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

import {
  DASHBOARD_TATICO_PRIORITY_OPTIONS,
  type DashboardTaticoAdvancedFilterForm,
  emptyDashboardTaticoAdvancedFilters,
  OPERATIONAL_VIEW_STATUS_OPTIONS,
} from '../../components/filters'

export type OperationalViewAdvancedFilterForm =
  DashboardTaticoAdvancedFilterForm

export const OPERATIONAL_VIEW_PRIORITY_OPTIONS =
  DASHBOARD_TATICO_PRIORITY_OPTIONS

export { OPERATIONAL_VIEW_STATUS_OPTIONS }

const priorityLabelByValue = new Map(
  OPERATIONAL_VIEW_PRIORITY_OPTIONS.map((o) => [o.value, o.label]),
)

const statusLabelByValue = new Map(
  OPERATIONAL_VIEW_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

export const emptyOperationalViewAdvancedFilters =
  emptyDashboardTaticoAdvancedFilters

export function countOperationalViewAdvancedFiltersFromApi(
  filters: OperationalViewFilterIn,
): number {
  let count = 0

  count += filters.operation_id?.length ?? 0
  count += filters.requester?.length ?? 0

  count += filters.priority?.length ?? 0

  count += filters.status?.length ?? 0

  count += filters.ticket_type_id?.length ?? 0

  if (filters.media_relevant === true) {
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
  filters: OperationalViewFilterIn,
): OperationalViewAdvancedFilterForm {
  return {
    operation_id: (filters.operation_id ?? []).map((value) => ({
      value,
      label: value,
    })),
    requester: (filters.requester ?? []).map((value) => ({
      value,

      label: value,
    })),

    priority: toSearchOptions(
      filters.priority,

      priorityLabelByValue,
    ) as SearchOption[],

    status: toSearchOptions(
      filters.status,

      statusLabelByValue,
    ) as SearchOption[],

    ticket_type_id: (filters.ticket_type_id ?? []).map((value) => ({
      value,

      label: value,
    })),

    relevanteImprensa: filters.media_relevant === true,
  }
}

export function advancedFiltersToApiPatch(
  form: OperationalViewAdvancedFilterForm,
): Pick<
  OperationalViewFilterIn,
  | 'operation_id'
  | 'requester'
  | 'priority'
  | 'status'
  | 'ticket_type_id'
  | 'media_relevant'
> {
  return {
    operation_id: form.operation_id.length
      ? form.operation_id.map((item) => item.value)
      : undefined,
    requester: form.requester.length
      ? form.requester.map((item) => item.value)
      : undefined,

    priority: form.priority.length
      ? (form.priority.map((item) => item.value) as OperationalViewPriority[])
      : undefined,

    status: form.status.length
      ? (form.status.map((item) => item.value) as OperationalViewStatus[])
      : undefined,

    ticket_type_id: form.ticket_type_id.length
      ? form.ticket_type_id.map((item) => item.value)
      : undefined,

    media_relevant: form.relevanteImprensa ? true : null,
  }
}

export function stripAdvancedFiltersFromApi(
  filters: OperationalViewFilterIn,
): OperationalViewFilterIn {
  const rest = { ...filters }

  delete rest.operation_id
  delete rest.requester

  delete rest.priority

  delete rest.status

  delete rest.ticket_type_id

  delete rest.media_relevant

  return rest
}

export function formatOperationalViewAdvancedFiltersSummary(
  filters: OperationalViewFilterIn,
): string[] {
  const lines: string[] = []

  if (filters.operation_id?.length) {
    lines.push(`Demandante: ${filters.operation_id.length} selecionado(s)`)
  }
  if (filters.requester?.length) {
    lines.push(`Requisitante: ${filters.requester.join(', ')}`)
  }

  if (filters.priority?.length) {
    const labels = filters.priority.map((p) => priorityLabelByValue.get(p) ?? p)

    lines.push(`Urgência: ${labels.join(', ')}`)
  }

  if (filters.status?.length) {
    const labels = filters.status.map((s) => statusLabelByValue.get(s) ?? s)

    lines.push(`Status: ${labels.join(', ')}`)
  }

  if (filters.ticket_type_id?.length) {
    lines.push(
      `Tipo de chamado: ${filters.ticket_type_id.length} selecionado(s)`,
    )
  }

  if (filters.media_relevant === true) {
    lines.push('Relevante para imprensa: Sim')
  }

  return lines
}
