import type {
  DemandVolumeFilterIn,
  TicketPriority,
  TicketStatus,
} from '@/http/tickets/get-demand-volume'
import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

export type DemandVolumePressFilter = 'all' | 'yes' | 'no'

export type DemandVolumeAdvancedFilterForm = {
  requisitante: SearchOption[]
  prioridade: SearchOption[]
  status: SearchOption[]
  tipo_chamado_id: SearchOption[]
  relevanteImprensa: DemandVolumePressFilter
}

export const DEMAND_VOLUME_PRIORITY_OPTIONS: SearchOption[] = [
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'ROTINA', label: 'Rotina' },
]

export const DEMAND_VOLUME_STATUS_OPTIONS: SearchOption[] = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'RESTRITO', label: 'Restrito' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
  { value: 'AGUARDANDO_REVISAO', label: 'Aguardando revisão' },
  { value: 'CONCLUIDO', label: 'Concluído' },
]

const priorityLabelByValue = new Map(
  DEMAND_VOLUME_PRIORITY_OPTIONS.map((o) => [o.value, o.label]),
)
const statusLabelByValue = new Map(
  DEMAND_VOLUME_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

export function emptyDemandVolumeAdvancedFilters(): DemandVolumeAdvancedFilterForm {
  return {
    requisitante: [],
    prioridade: [],
    status: [],
    tipo_chamado_id: [],
    relevanteImprensa: 'all',
  }
}

export function countDemandVolumeAdvancedFilters(
  form: DemandVolumeAdvancedFilterForm,
): number {
  let count = 0
  count += form.requisitante.length
  count += form.prioridade.length
  count += form.status.length
  count += form.tipo_chamado_id.length
  if (form.relevanteImprensa !== 'all') count += 1
  return count
}

export function countDemandVolumeAdvancedFiltersFromApi(
  filters: DemandVolumeFilterIn,
): number {
  let count = 0
  count += filters.requisitante?.length ?? 0
  count += filters.prioridade?.length ?? 0
  count += filters.status?.length ?? 0
  count += filters.tipo_chamado_id?.length ?? 0
  if (
    filters.relevante_imprensa === true ||
    filters.relevante_imprensa === false
  ) {
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
  let relevanteImprensa: DemandVolumePressFilter = 'all'
  if (filters.relevante_imprensa === true) relevanteImprensa = 'yes'
  if (filters.relevante_imprensa === false) relevanteImprensa = 'no'

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
    relevanteImprensa,
  }
}

export function advancedFiltersToApiPatch(
  form: DemandVolumeAdvancedFilterForm,
): Pick<
  DemandVolumeFilterIn,
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
      ? (form.status.map((item) => item.value) as TicketStatus[])
      : undefined,
    tipo_chamado_id: form.tipo_chamado_id.length
      ? form.tipo_chamado_id.map((item) => item.value)
      : undefined,
    relevante_imprensa:
      form.relevanteImprensa === 'yes'
        ? true
        : form.relevanteImprensa === 'no'
          ? false
          : undefined,
  }
}

export function stripAdvancedFiltersFromApi(
  filters: DemandVolumeFilterIn,
): DemandVolumeFilterIn {
  const rest = { ...filters }
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
  if (filters.relevante_imprensa === false) {
    lines.push('Relevante para imprensa: Não')
  }
  return lines
}
