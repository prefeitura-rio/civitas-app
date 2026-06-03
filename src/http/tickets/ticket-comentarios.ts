import { api } from '@/lib/api'

export type TicketCommentListItem = {
  id: string
  ticket_id: string
  created_at: string
  author_id?: string | null
  author_name?: string | null
  author_roles: string[]
  body: string
}

export type TicketCommentCreateIn = {
  body: string
}

export async function getTicketComments(ticketId: string) {
  const { data } = await api.get<TicketCommentListItem[]>(
    `/tickets/${encodeURIComponent(ticketId)}/comments`,
  )
  return data
}

export async function postTicketComment(
  ticketId: string,
  payload: TicketCommentCreateIn,
) {
  const { data } = await api.post<boolean>(
    `/tickets/${encodeURIComponent(ticketId)}/comments`,
    payload,
  )
  return data
}
