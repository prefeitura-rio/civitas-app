import { api } from '@/lib/api'

/** GET `/tickets/{ticket_id}/emails-notificacao` */
export async function getTicketNotificationEmails(ticketId: string) {
  const { data } = await api.get<string[]>(
    `/tickets/${encodeURIComponent(ticketId)}/emails-notificacao`,
  )
  return data
}
