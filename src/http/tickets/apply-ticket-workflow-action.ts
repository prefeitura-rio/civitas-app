import { api } from '@/lib/api'

export type ApplyTicketWorkflowActionOut = {
  success: boolean
  is_actor_responsible: boolean
}

export type ApplyTicketWorkflowActionIn = {
  comentario?: string | null
}

export async function applyTicketWorkflowAction(
  ticketId: string,
  actionId: string,
  payload: ApplyTicketWorkflowActionIn,
) {
  const { data } = await api.post<ApplyTicketWorkflowActionOut>(
    `/tickets/${encodeURIComponent(ticketId)}/workflow/actions/${encodeURIComponent(actionId)}`,
    payload,
  )
  return data
}
