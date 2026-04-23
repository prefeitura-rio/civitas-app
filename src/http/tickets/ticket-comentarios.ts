import { api } from '@/lib/api'

/** Resposta de GET/POST `/tickets/{id}/comentarios` (timeline com badges). */
export type TicketCommentListItem = {
  id: string
  chamado_id: string
  criado_em: string
  autor_id?: string | null
  autor_nome?: string | null
  autor_papeis: string[]
  corpo: string
}

export type TicketCommentCreateIn = {
  corpo: string
}

export async function getTicketComments(ticketId: string) {
  const { data } = await api.get<TicketCommentListItem[]>(
    `/tickets/${encodeURIComponent(ticketId)}/comentarios`,
  )
  return data
}

export async function postTicketComment(
  ticketId: string,
  payload: TicketCommentCreateIn,
) {
  const { data } = await api.post<TicketCommentListItem>(
    `/tickets/${encodeURIComponent(ticketId)}/comentarios`,
    payload,
  )
  return data
}
