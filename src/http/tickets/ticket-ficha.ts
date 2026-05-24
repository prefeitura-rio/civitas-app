import type { TicketRelacionadoOut } from '@/http/tickets/get-ticket-by-id'
import { api } from '@/lib/api'

export type TicketFichaOut = {
  id: string
  tipo_chamado_id: string
  tipo_chamado_nome: string
  numero_interno: number
  numero_oficio?: string | null
  numero_procedimento?: string | null
  natureza_id?: string | null
  natureza_nome?: string | null
  possui_apelido_imprensa: boolean
  apelido_imprensa?: string | null
  link_materia?: string | null
  numero_processo_sei?: string | null
  link_processo_sei?: string | null
  chamados_relacionados: TicketRelacionadoOut[]
}

export type TicketFichaUpdateIn = {
  tipo_chamado_id: string
  numero_procedimento?: string | null
  numero_oficio?: string | null
  natureza_id?: string | null
  possui_apelido_imprensa: boolean
  apelido_imprensa?: string | null
  link_materia?: string | null
  numero_processo_sei?: string | null
  link_processo_sei?: string | null
}

export async function getTicketFicha(ticketId: string) {
  const { data } = await api.get<TicketFichaOut>(`/tickets/${ticketId}/ficha`)
  return data
}

export async function updateTicketFicha(
  ticketId: string,
  payload: TicketFichaUpdateIn,
) {
  const { data } = await api.put<TicketFichaOut>(
    `/tickets/${ticketId}/ficha`,
    payload,
  )
  return data
}
