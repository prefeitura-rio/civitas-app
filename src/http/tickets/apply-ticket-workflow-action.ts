import { api } from '@/lib/api'

export type ApplyTicketWorkflowActionOut = {
  success: boolean
  is_actor_responsible: boolean
}

export type ApplyTicketWorkflowReassignIn = {
  team_id: string
  assignee_ids: string[]
  priority?: 'URGENTE' | 'ALTA' | 'ROTINA' | null
  comment?: string | null
}

export type ApplyTicketWorkflowActionIn = {
  comment?: string | null
  reassignment?: ApplyTicketWorkflowReassignIn | null
}

export async function applyTicketWorkflowAction(
  ticketId: string,
  actionId: string,
  payload: ApplyTicketWorkflowActionIn,
) {
  const { data } = await api.post<ApplyTicketWorkflowActionOut>(
    `/workflow/${encodeURIComponent(ticketId)}/actions/${encodeURIComponent(actionId)}`,
    payload,
  )
  return data
}
