import { api } from '@/lib/api'

export type TicketDashboardWidgetsConfigField =
  | 'total_call_volume'
  | 'closed_calls_by_urgency'
  | 'closed_calls_by_nature'
  | 'closed_calls_by_service'
  | 'media_relevant_calls_volume'
  | 'average_resolution_time_general'
  | 'average_resolution_time_by_profile'
  | 'average_resolution_time_by_urgency'
  | 'delivery_time_performance_by_urgency'
  | 'delivery_time_performance_by_service'
  | 'delivery_time_for_media_relevant'
  | 'open_calls_by_team'
  | 'closed_calls_by_team'
  | 'delivery_time_by_team'
  | 'sla_attainment_by_team'
  | 'closed_calls_by_requester_sphere'
  | 'closed_calls_by_requester'
  | 'closed_calls_by_requester_agency'
  | 'closed_calls_by_requester_type'
  | 'closed_calls_by_requester_institution'

export type TicketDashboardWidgetsConfigUpdateIn = Partial<
  Record<TicketDashboardWidgetsConfigField, boolean>
>

export type TicketDashboardWidgetsConfigOut = {
  id: string
  created_at: string
  updated_at: string
} & Record<TicketDashboardWidgetsConfigField, boolean>

export type TicketDashboardWidgetsFormValues = Record<
  TicketDashboardWidgetsConfigField,
  boolean
>

export const WIDGETS_CONFIG_DEFAULT_VALUES: TicketDashboardWidgetsFormValues = {
  total_call_volume: true,
  closed_calls_by_urgency: true,
  closed_calls_by_nature: true,
  closed_calls_by_service: true,
  media_relevant_calls_volume: true,
  average_resolution_time_general: true,
  average_resolution_time_by_profile: true,
  average_resolution_time_by_urgency: true,
  delivery_time_performance_by_urgency: true,
  delivery_time_performance_by_service: true,
  delivery_time_for_media_relevant: true,
  open_calls_by_team: true,
  closed_calls_by_team: true,
  delivery_time_by_team: true,
  sla_attainment_by_team: true,
  closed_calls_by_requester_sphere: true,
  closed_calls_by_requester: true,
  closed_calls_by_requester_agency: true,
  closed_calls_by_requester_type: true,
  closed_calls_by_requester_institution: true,
}

export function mapWidgetsConfigOutToFormValues(
  config: TicketDashboardWidgetsConfigOut,
): TicketDashboardWidgetsFormValues {
  return {
    total_call_volume: config.total_call_volume,
    closed_calls_by_urgency: config.closed_calls_by_urgency,
    closed_calls_by_nature: config.closed_calls_by_nature,
    closed_calls_by_service: config.closed_calls_by_service,
    media_relevant_calls_volume: config.media_relevant_calls_volume,
    average_resolution_time_general: config.average_resolution_time_general,
    average_resolution_time_by_profile:
      config.average_resolution_time_by_profile,
    average_resolution_time_by_urgency:
      config.average_resolution_time_by_urgency,
    delivery_time_performance_by_urgency:
      config.delivery_time_performance_by_urgency,
    delivery_time_performance_by_service:
      config.delivery_time_performance_by_service,
    delivery_time_for_media_relevant: config.delivery_time_for_media_relevant,
    open_calls_by_team: config.open_calls_by_team,
    closed_calls_by_team: config.closed_calls_by_team,
    delivery_time_by_team: config.delivery_time_by_team,
    sla_attainment_by_team: config.sla_attainment_by_team,
    closed_calls_by_requester_sphere: config.closed_calls_by_requester_sphere,
    closed_calls_by_requester: config.closed_calls_by_requester,
    closed_calls_by_requester_agency: config.closed_calls_by_requester_agency,
    closed_calls_by_requester_type: config.closed_calls_by_requester_type,
    closed_calls_by_requester_institution:
      config.closed_calls_by_requester_institution,
  }
}

export async function getTicketDashboardWidgetsConfig() {
  const { data } = await api.get<TicketDashboardWidgetsConfigOut>(
    '/ticket-dashboard/widgets-config/',
  )
  return data
}

export async function updateTicketDashboardWidgetsConfig(
  payload: TicketDashboardWidgetsConfigUpdateIn,
) {
  const { data } = await api.put<TicketDashboardWidgetsConfigOut>(
    '/ticket-dashboard/widgets-config/',
    payload,
  )
  return data
}
