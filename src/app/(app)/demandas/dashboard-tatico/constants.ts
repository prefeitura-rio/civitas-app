export const DASHBOARD_DEMAND_VOLUME_SCREEN_CODE = 'dashboard_demand_volume'
export const DASHBOARD_SLA_SCREEN_CODE = 'dashboard_sla'
export const DASHBOARD_OPERATIONAL_VIEW_SCREEN_CODE =
  'dashboard_operational_view'

export const TACTICAL_DASHBOARD_TAB_SCREEN_CODES = [
  DASHBOARD_DEMAND_VOLUME_SCREEN_CODE,
  DASHBOARD_SLA_SCREEN_CODE,
  DASHBOARD_OPERATIONAL_VIEW_SCREEN_CODE,
] as const

export const TACTICAL_DASHBOARD_TABS = [
  {
    href: '/demandas/dashboard-tatico/volume',
    label: 'Volume de Demandas',
    screenCode: DASHBOARD_DEMAND_VOLUME_SCREEN_CODE,
  },
  {
    href: '/demandas/dashboard-tatico/metricas',
    label: 'Métricas de Resposta',
    screenCode: DASHBOARD_SLA_SCREEN_CODE,
  },
  {
    href: '/demandas/dashboard-tatico/visao-operacional',
    label: 'Visão Operacional',
    screenCode: DASHBOARD_OPERATIONAL_VIEW_SCREEN_CODE,
  },
] as const
