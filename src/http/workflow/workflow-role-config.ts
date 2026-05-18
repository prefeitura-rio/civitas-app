import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { api } from '@/lib/api'

export type WorkflowRoleEnum = UserRoleEnum

export interface WorkflowCatalogItem {
  code: string
  label?: string
}

export interface WorkflowPermission {
  state_code: string
  allowed_action_codes: string[]
}

export interface WorkflowTransition {
  from_state_code: string
  action_code: string
  to_state_code: string
  target_profile_codes: string[]
}

export interface WorkflowRoleConfigResponse {
  ticket_type_id?: string | null
  ticket_type_name?: string | null
  states: WorkflowCatalogItem[]
  actions: WorkflowCatalogItem[]
  profiles: WorkflowCatalogItem[]
  permissions: WorkflowPermission[]
  transitions: WorkflowTransition[]
}

export interface UpdateWorkflowRoleConfigRequest {
  ticket_type_id: string
  role: WorkflowRoleEnum
  permissions: WorkflowPermission[]
  transitions: WorkflowTransition[]
}

export async function getWorkflowRoleConfig(
  ticketTypeId: string,
  role: WorkflowRoleEnum,
) {
  const { data } = await api.get<WorkflowRoleConfigResponse>(
    `/workflow/ticket-types/${encodeURIComponent(ticketTypeId)}/roles/${encodeURIComponent(role)}`,
  )
  return data
}

export async function updateWorkflowRoleConfig({
  ticket_type_id: ticketTypeId,
  role,
  permissions,
  transitions,
}: UpdateWorkflowRoleConfigRequest) {
  const { data } = await api.put<WorkflowRoleConfigResponse>(
    `/workflow/ticket-types/${encodeURIComponent(ticketTypeId)}/roles/${encodeURIComponent(role)}`,
    {
      permissions,
      transitions,
    },
  )
  return data
}
