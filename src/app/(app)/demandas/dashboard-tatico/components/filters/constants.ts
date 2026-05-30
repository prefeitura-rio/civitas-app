import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

import type { DashboardTaticoAdvancedFilterForm } from './types'

export const DASHBOARD_TATICO_PRIORITY_OPTIONS: SearchOption[] = [
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'ROTINA', label: 'Rotina' },
]

export function emptyDashboardTaticoAdvancedFilters(): DashboardTaticoAdvancedFilterForm {
  return {
    operation_id: [],
    requester: [],
    priority: [],
    status: [],
    ticket_type_id: [],
    relevanteImprensa: false,
  }
}
