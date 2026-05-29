import type { TicketDashboardSlaFormValues } from '@/http/tickets/ticket-dashboard-sla-config'

export type SlaConfigFieldName = keyof TicketDashboardSlaFormValues

export type SlaConfigField = {
  name: SlaConfigFieldName
  label: string
}

export const SLA_CONFIG_FIELDS: SlaConfigField[] = [
  { name: 'image_search_days', label: 'busca por imagem' },
  { name: 'electronic_fence_days', label: 'cerco eletrônico' },
  { name: 'radar_search_days', label: 'busca por radar' },
  { name: 'license_plate_search_days', label: 'busca por placa' },
  { name: 'related_license_plates_days', label: 'placa correlatas' },
  { name: 'joint_license_plates_days', label: 'placas conjuntas' },
  { name: 'image_analysis_days', label: 'análise de imagem' },
  { name: 'others_days', label: 'outros' },
  { name: 'atlas_civitas_days', label: 'atlas civitas' },
]

export const SLA_DAY_OPTIONS = Array.from({ length: 30 }, (_, index) => {
  const value = index + 1
  return {
    value: String(value),
    label: value === 1 ? '1 dia' : `${value} dias`,
  }
})

export function formatSlaDaysLabel(days: number): string {
  return days === 1 ? '1 dia' : `${days} dias`
}
