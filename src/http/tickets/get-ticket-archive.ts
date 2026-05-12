import { api } from '@/lib/api'

export type TicketArchiveServiceFilter =
  | 'plate_search_services'
  | 'radar_search_services'
  | 'electronic_fence_services'
  | 'image_search_services'
  | 'correlated_plate_services'
  | 'joint_plate_services'
  | 'image_reservation_services'
  | 'image_analysis_services'
  | 'other_services'

export type TicketArchiveFilters = {
  search?: string
  page?: number
  page_size?: number
  demandante_id?: string[]
  requisitante?: string[]
  responsavel_id?: string[]
  data_base_inicio?: string
  data_base_fim?: string
  data_entrada_inicio?: string
  data_entrada_fim?: string
  prioridade?: string[]
  equipe?: string[]
  servicos?: TicketArchiveServiceFilter[]
}

export type TicketArchiveListItem = {
  id: string
  chamado: string
  demandante: string
  equipe: string
  responsavel: string
  servicos: string[]
  status: string
}

export type TicketArchivePageOut = {
  items: TicketArchiveListItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

export async function getTicketArchive(filters: TicketArchiveFilters) {
  const response = await api.post<TicketArchivePageOut>('/tickets/archive', {
    search: filters.search?.trim() || undefined,
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    demandante_id: filters.demandante_id,
    requisitante: filters.requisitante,
    responsavel_id: filters.responsavel_id,
    data_base_inicio: filters.data_base_inicio || undefined,
    data_base_fim: filters.data_base_fim || undefined,
    data_entrada_inicio: filters.data_entrada_inicio || undefined,
    data_entrada_fim: filters.data_entrada_fim || undefined,
    prioridade: filters.prioridade,
    equipe: filters.equipe,
    servicos: filters.servicos,
  })

  return response.data
}
