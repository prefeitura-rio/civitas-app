import { api } from '@/lib/api'

export type ApplyTicketWorkflowActionOut = {
  success: boolean
  is_actor_responsible: boolean
}

export async function applyTicketWorkflowAction(
  ticketId: string,
  actionId: string,
) {
  const { data } = await api.post<ApplyTicketWorkflowActionOut>(
    `/tickets/${encodeURIComponent(ticketId)}/workflow/actions/${encodeURIComponent(actionId)}`,
  )
  return data
}
