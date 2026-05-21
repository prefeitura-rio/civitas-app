import type { TicketDashboardWidgetsConfigField } from '@/http/tickets/ticket-dashboard-widgets-config'

export type WidgetConfigField = {
  name: TicketDashboardWidgetsConfigField
  label: string
}

export type WidgetConfigSection = {
  id: string
  title: string
  fields: WidgetConfigField[]
}

export const WIDGET_CONFIG_SECTIONS: WidgetConfigSection[] = [
  {
    id: 'volumes-estados',
    title: 'volumes e estados',
    fields: [
      {
        name: 'total_call_volume',
        label: 'volume total de chamados',
      },
      {
        name: 'closed_calls_by_urgency',
        label: 'volume de chamados encerrados por urgência',
      },
      {
        name: 'closed_calls_by_nature',
        label: 'volume de chamados encerrados por natureza',
      },
      {
        name: 'closed_calls_by_service',
        label: 'volume de chamados encerrados por serviço',
      },
      {
        name: 'media_relevant_calls_volume',
        label: 'volume de chamados com relevância na mídia',
      },
    ],
  },
  {
    id: 'metricas-resposta',
    title: 'métricas de resposta',
    fields: [
      {
        name: 'average_resolution_time_general',
        label: 'tempo médio de resolução - geral',
      },
      {
        name: 'average_resolution_time_by_profile',
        label: 'tempo médio de resolução por perfil',
      },
      {
        name: 'average_resolution_time_by_urgency',
        label: 'tempo médio de resolução por urgência',
      },
      {
        name: 'delivery_time_performance_by_urgency',
        label: 'performance de tempo de entrega por urgência',
      },
      {
        name: 'delivery_time_performance_by_service',
        label: 'performance de tempo de entrega por serviço',
      },
      {
        name: 'delivery_time_for_media_relevant',
        label: 'tempo de entrega por relevantes para mídia',
      },
    ],
  },
  {
    id: 'visao-operacional',
    title: 'visão operacional',
    fields: [
      {
        name: 'open_calls_by_team',
        label: 'abertos com cada equipe',
      },
      {
        name: 'closed_calls_by_team',
        label: 'volume de chamados encerrados por equipe',
      },
      {
        name: 'delivery_time_by_team',
        label: 'tempo de entrega por equipe',
      },
      {
        name: 'sla_attainment_by_team',
        label: 'atingimento de sla por equipe',
      },
    ],
  },
  {
    id: 'demandantes',
    title: 'demandantes',
    fields: [
      {
        name: 'closed_calls_by_requester_sphere',
        label: 'volume de chamados encerrados por demandantes - esfera',
      },
      {
        name: 'closed_calls_by_requester',
        label: 'volume de chamados encerrados por demandantes',
      },
      {
        name: 'closed_calls_by_requester_agency',
        label: 'volume de chamados encerrados por demandantes - órgão',
      },
      {
        name: 'closed_calls_by_requester_type',
        label:
          'volume de chamados encerrados por demandantes - tipo de requisitante',
      },
      {
        name: 'closed_calls_by_requester_institution',
        label: 'volume de chamados encerrados por demandantes - instituição',
      },
    ],
  },
]
