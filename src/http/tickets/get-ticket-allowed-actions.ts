import { api } from '@/lib/api'

export type TicketAllowedActionsOut = {
  ticket_id: string
  state_id: string
  profile_id?: string | null
  can_view: boolean
  allowed_action_ids: string[]
}

/** GET `/tickets/{ticket_id}/workflow/allowed-actions` */
export async function getTicketAllowedActions(ticketId: string) {
  const { data } = await api.get<TicketAllowedActionsOut>(
    `/workflow/${encodeURIComponent(ticketId)}/allowed-actions`,
  )
  return data
}
