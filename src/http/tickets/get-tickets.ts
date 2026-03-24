import { api } from '@/lib/api'

export interface TicketListItem {
  id: string
  criado_em: string // datetime ISO
  tipo_chamado_id: string
  operation_id: string | null
  prioridade: 'URGENTE' | 'ALTA' | 'ROTINA'
  natureza:
    | 'CIVIL'
    | 'CRIMINAL'
    | 'TRABALHISTA'
    | 'ADMINISTRATIVO'
    | 'OUTROS'
    | null
  numero_procedimento: string | null
  numero_oficio: string | null
  requisitante_nome: string
  comments_count: number
  last_comment_at: string | null
}

export interface TicketsPageOut {
  items: TicketListItem[]
  page: number
  size: number
  total: number
}

export interface GetTicketsRequest {
  page?: number
  size?: number
}

export async function getTickets({ page = 1, size = 20 }: GetTicketsRequest) {
  return api.get<TicketsPageOut>('/tickets', { params: { page, size } })
}
