import { api } from '@/lib/api'

export type ApplyTicketWorkflowActionOut = {
  success: boolean
  is_actor_responsible: boolean
}

export type ApplyTicketWorkflowReassignIn = {
  equipe_id: string
  responsavel_ids: string[]
  prioridade?: 'URGENTE' | 'ALTA' | 'ROTINA' | null
  comentario?: string | null
}

export type ApplyTicketWorkflowActionIn = {
  comentario?: string | null
  reatribuicao?: ApplyTicketWorkflowReassignIn | null
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
