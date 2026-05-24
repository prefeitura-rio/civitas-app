import type {
  SlaDashboardFilterIn,
  SlaTicketStatus,
  TicketPriority,
} from '@/http/tickets/get-sla-dashboard'
import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

export type SlaMetricsAdvancedFilterForm = {
  requisitante: SearchOption[]
  prioridade: SearchOption[]
  status: SearchOption[]
  tipo_chamado_id: SearchOption[]
  relevanteImprensa: boolean
}

export const SLA_METRICS_PRIORITY_OPTIONS: SearchOption[] = [
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'ROTINA', label: 'Rotina' },
]

export const SLA_METRICS_STATUS_OPTIONS: SearchOption[] = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'AGUARDANDO_REVISAO_ADJUNTO', label: 'Aguardando revisão adjunto' },
  {
    value: 'AGUARDANDO_REVISAO_ADMINISTRATIVO',
    label: 'Aguardando revisão administrativo',
  },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'DEMANDA_RESPONDIDA', label: 'Demanda respondida' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
  { value: 'RESTRITO', label: 'Restrito' },
]

const priorityLabelByValue = new Map(
  SLA_METRICS_PRIORITY_OPTIONS.map((o) => [o.value, o.label]),
)
const statusLabelByValue = new Map(
  SLA_METRICS_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

export function emptySlaMetricsAdvancedFilters(): SlaMetricsAdvancedFilterForm {
  return {
    requisitante: [],
    prioridade: [],
    status: [],
    tipo_chamado_id: [],
    relevanteImprensa: false,
  }
}

export function countSlaMetricsAdvancedFiltersFromApi(
  filters: SlaDashboardFilterIn,
): number {
  let count = 0
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
  | 'requisitante'
  | 'prioridade'
  | 'status'
  | 'tipo_chamado_id'
  | 'relevante_imprensa'
> {
  return {
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
}

export function formatSlaPerformanceRowLabel(label: string): string {
  return SLA_PRIORITY_ROW_LABELS[label] ?? label
}
