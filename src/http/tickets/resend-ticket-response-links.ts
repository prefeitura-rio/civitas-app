import { api } from '@/lib/api'

export type ResendTicketResponseLinksOut = {
  success: boolean
  recipients: string[]
  link_count: number
}

/** POST `/workflow/{ticket_id}/resend-response-links` */
export async function resendTicketResponseLinks(ticketId: string) {
  const { data } = await api.post<ResendTicketResponseLinksOut>(
    `/workflow/${encodeURIComponent(ticketId)}/resend-response-links`,
  )
  return data
}
