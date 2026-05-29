import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

export type DashboardTaticoAdvancedFilterForm = {
  demandante_id: SearchOption[]
  requisitante: SearchOption[]
  prioridade: SearchOption[]
  status: SearchOption[]
  tipo_chamado_id: SearchOption[]
  relevanteImprensa: boolean
}

/** Identificador da aba — usado em query keys e ids de acessibilidade. */
export type DashboardTaticoFilterScope =
  | 'operational-view'
  | 'sla-metrics'
  | 'demand-volume'
