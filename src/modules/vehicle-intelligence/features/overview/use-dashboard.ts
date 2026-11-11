import { OVERVIEW_FILTERS } from '@/modules/vehicle-intelligence/features/overview/overview-variants'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { dashboardPath } from '@/modules/vehicle-intelligence/lib/api'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

const DASHBOARD_PATH = dashboardPath(OVERVIEW_FILTERS)

/** Panorama do recorte inteiro, com os filtros fixos da visão geral. */
export function useDashboard() {
  const { data, error, loading } = useApi<DashboardData>(DASHBOARD_PATH, {
    delayMs: 120,
  })
  // Carregando desde a montagem até a primeira resposta (inclusive durante a espera de 120 ms).
  return { data, error, loading: loading || (!data && !error) }
}
