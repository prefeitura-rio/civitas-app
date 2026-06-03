import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

export type DashboardTaticoAdvancedFilterForm = {
  operation_id: SearchOption[]
  requester: SearchOption[]
  priority: SearchOption[]
  status: SearchOption[]
  ticket_type_id: SearchOption[]
  relevanteImprensa: boolean
}

/** Identificador da aba — usado em query keys e ids de acessibilidade. */
export type DashboardTaticoFilterScope =
  | 'operational-view'
  | 'sla-metrics'
  | 'demand-volume'
