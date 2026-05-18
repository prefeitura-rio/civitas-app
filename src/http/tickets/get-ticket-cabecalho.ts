import { api } from '@/lib/api'

export type TicketCabecalhoOut = {
  internal_number: string
  status: string
  tipo_chamado_nome?: string | null
  prioridade?: string | null
  data_base?: string | null
  equipe?: string | null
  created_at: string
  responsavel?: string | null
  tempo_aberto: string
}

export async function getTicketCabecalho(ticketId: string) {
  const { data } = await api.get<TicketCabecalhoOut>(
    `/tickets/${ticketId}/cabecalho`,
  )
  return data
}
