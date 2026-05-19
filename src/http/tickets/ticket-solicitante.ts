import type {
  TicketCreateFocalPointOut,
  TicketCreateRequesterOut,
} from '@/http/tickets/get-ticket-by-id'
import { api } from '@/lib/api'

export type TicketSolicitanteOut = {
  chamado_id: string
  operation_id: string
  demandante: string
  requisitante: TicketCreateRequesterOut
  pontos_focais: TicketCreateFocalPointOut[]
}

export type TicketSolicitanteUpsertIn = {
  operation_id: string
  requisitante: TicketCreateRequesterOut
  pontos_focais: TicketCreateFocalPointOut[]
}

export async function getTicketSolicitante(ticketId: string) {
  const { data } = await api.get<TicketSolicitanteOut>(
    `/tickets/${ticketId}/solicitante`,
  )
  return data
}

export async function updateTicketSolicitante(
  ticketId: string,
  payload: TicketSolicitanteUpsertIn,
) {
  const { data } = await api.put<TicketSolicitanteOut>(
    `/tickets/${ticketId}/solicitante`,
    payload,
  )
  return data
}
