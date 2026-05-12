import { api } from '@/lib/api'

export type TicketDashboardFilters = {
  period_days?: number
  overdue_after_days?: number
  search?: string

  tipo_chamado_id?: string[]
  numero_interno?: number[]
  numero_procedimento?: string[]
  numero_oficio?: string[]
  natureza_id?: string[]
  demandante_id?: string[]
  requisitante?: string[]
  responsavel_id?: string[]
  ponto_focal?: string[]

  data_base_inicio?: string
  data_base_fim?: string

  data_entrada_inicio?: string
  data_entrada_fim?: string

  status?: string[]
  prioridade?: string[]
  equipe?: string[]
  /** Valores da API, ex.: plate_search_services */
  servicos?: string[]
}

export async function getTicketsDashboard(filters: TicketDashboardFilters) {
  const response = await api.post('/tickets/dashboard', {
    period_days: filters.period_days ?? 30,
    overdue_after_days: filters.overdue_after_days ?? 7,
    search: filters.search?.trim() || undefined,

    tipo_chamado_id: filters.tipo_chamado_id,
    numero_interno: filters.numero_interno,
    numero_procedimento: filters.numero_procedimento,
    numero_oficio: filters.numero_oficio,
    natureza_id: filters.natureza_id,
    demandante_id: filters.demandante_id,
    requisitante: filters.requisitante,
    responsavel_id: filters.responsavel_id,
    ponto_focal: filters.ponto_focal,

    data_base_inicio: filters.data_base_inicio,
    data_base_fim: filters.data_base_fim,

    data_entrada_inicio: filters.data_entrada_inicio,
    data_entrada_fim: filters.data_entrada_fim,

    status: filters.status,
    prioridade: filters.prioridade,
    equipe: filters.equipe,
    servicos: filters.servicos,
  })

  return response.data
}
