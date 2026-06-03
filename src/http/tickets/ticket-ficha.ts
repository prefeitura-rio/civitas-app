import type { TicketRelatedOut } from '@/http/tickets/get-ticket-by-id'
import { api } from '@/lib/api'

export type TicketRecordOut = {
  id: string

  ticket_type_id: string

  ticket_type_name: string

  internal_number: number

  official_letter_number?: string | null

  procedure_number?: string | null

  nature_id?: string | null

  nature_name?: string | null

  has_press_alias: boolean

  press_alias?: string | null

  article_link?: string | null

  sei_process_number?: string | null

  sei_process_link?: string | null

  related_tickets: TicketRelatedOut[]
}

export type TicketRecordUpdateIn = {
  ticket_type_id: string

  procedure_number?: string | null

  official_letter_number?: string | null

  nature_id?: string | null

  has_press_alias: boolean

  press_alias?: string | null

  article_link?: string | null

  sei_process_number?: string | null

  sei_process_link?: string | null
}

/** @deprecated Use TicketRecordOut */

export type TicketFichaOut = TicketRecordOut

/** @deprecated Use TicketRecordUpdateIn */

export type TicketFichaUpdateIn = TicketRecordUpdateIn

export async function getTicketFicha(ticketId: string) {
  const { data } = await api.get<TicketRecordOut>(`/tickets/${ticketId}/record`)

  return data
}

export async function updateTicketFicha(
  ticketId: string,

  payload: TicketRecordUpdateIn,
) {
  const { data } = await api.put<TicketRecordOut>(
    `/tickets/${ticketId}/record`,

    payload,
  )

  return data
}

export {
  getTicketFicha as getTicketRecord,
  updateTicketFicha as updateTicketRecord,
}
