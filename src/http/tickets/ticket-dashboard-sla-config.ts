import { api } from '@/lib/api'

export type TicketDashboardSlaConfigUpdateIn = Partial<
  Record<
    | 'image_search_days'
    | 'electronic_fence_days'
    | 'radar_search_days'
    | 'license_plate_search_days'
    | 'related_license_plates_days'
    | 'joint_license_plates_days'
    | 'image_analysis_days'
    | 'others_days',
    number
  >
>

export type TicketDashboardSlaConfigOut = {
  id: string
  created_at: string
  updated_at: string
  image_search_days: number
  electronic_fence_days: number
  radar_search_days: number
  license_plate_search_days: number
  related_license_plates_days: number
  joint_license_plates_days: number
  image_analysis_days: number
  others_days: number
}

export type TicketDashboardSlaFormValues = {
  image_search_days: number
  electronic_fence_days: number
  radar_search_days: number
  license_plate_search_days: number
  related_license_plates_days: number
  joint_license_plates_days: number
  image_analysis_days: number
  others_days: number
}

export const SLA_CONFIG_DEFAULT_VALUES: TicketDashboardSlaFormValues = {
  image_search_days: 3,
  electronic_fence_days: 1,
  radar_search_days: 2,
  license_plate_search_days: 1,
  related_license_plates_days: 1,
  joint_license_plates_days: 3,
  image_analysis_days: 1,
  others_days: 3,
}

export function mapSlaConfigOutToFormValues(
  config: TicketDashboardSlaConfigOut,
): TicketDashboardSlaFormValues {
  return {
    image_search_days: config.image_search_days,
    electronic_fence_days: config.electronic_fence_days,
    radar_search_days: config.radar_search_days,
    license_plate_search_days: config.license_plate_search_days,
    related_license_plates_days: config.related_license_plates_days,
    joint_license_plates_days: config.joint_license_plates_days,
    image_analysis_days: config.image_analysis_days,
    others_days: config.others_days,
  }
}

export async function getTicketDashboardSlaConfig() {
  const { data } = await api.get<TicketDashboardSlaConfigOut>(
    '/ticket-dashboard/sla-config/',
  )
  return data
}

export async function updateTicketDashboardSlaConfig(
  payload: TicketDashboardSlaConfigUpdateIn,
) {
  const { data } = await api.put<TicketDashboardSlaConfigOut>(
    '/ticket-dashboard/sla-config/',
    payload,
  )
  return data
}
