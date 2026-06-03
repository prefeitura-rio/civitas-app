import { api } from '@/lib/api'

/** GET `/tickets/{ticket_id}/notification-emails` */
export async function getTicketNotificationEmails(ticketId: string) {
  const { data } = await api.get<string[]>(
    `/tickets/${encodeURIComponent(ticketId)}/notification-emails`,
  )
  return data
}
