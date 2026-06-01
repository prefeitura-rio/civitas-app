import type {
  TicketFocalPointOut,
  TicketRequesterOut,
} from '@/http/tickets/get-ticket-by-id'
import { api } from '@/lib/api'

export type TicketRequesterOutFull = {
  ticket_id: string
  operation_id: string
  requester_operation: string
  requester: TicketRequesterOut
  focal_points: TicketFocalPointOut[]
}

export type TicketRequesterUpsertIn = {
  operation_id: string
  requester: TicketRequesterOut
  focal_points: TicketFocalPointOut[]
}

/** @deprecated Use TicketRequesterOutFull */
export type TicketSolicitanteOut = TicketRequesterOutFull

/** @deprecated Use TicketRequesterUpsertIn */
export type TicketSolicitanteUpsertIn = TicketRequesterUpsertIn

export async function getTicketSolicitante(ticketId: string) {
  const { data } = await api.get<TicketRequesterOutFull>(
    `/tickets/${ticketId}/requester`,
  )
  return data
}

export async function updateTicketSolicitante(
  ticketId: string,
  payload: TicketRequesterUpsertIn,
) {
  const { data } = await api.put<TicketRequesterOutFull>(
    `/tickets/${ticketId}/requester`,
    payload,
  )
  return data
}

export {
  getTicketSolicitante as getTicketRequester,
  updateTicketSolicitante as updateTicketRequester,
}
