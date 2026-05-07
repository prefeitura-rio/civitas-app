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
  states: WorkflowCatalogItem[]
  actions: WorkflowCatalogItem[]
  profiles: WorkflowCatalogItem[]
  permissions: WorkflowPermission[]
  transitions: WorkflowTransition[]
}

export interface UpdateWorkflowRoleConfigRequest {
  role: WorkflowRoleEnum
  permissions: WorkflowPermission[]
  transitions: WorkflowTransition[]
}

export async function getWorkflowRoleConfig(role: WorkflowRoleEnum) {
  const { data } = await api.get<WorkflowRoleConfigResponse>(
    `/workflow/roles/${encodeURIComponent(role)}`,
  )
  return data
}

export async function updateWorkflowRoleConfig({
  role,
  permissions,
  transitions,
}: UpdateWorkflowRoleConfigRequest) {
  const { data } = await api.put<WorkflowRoleConfigResponse>(
    `/workflow/roles/${encodeURIComponent(role)}`,
    {
      permissions,
      transitions,
    },
  )
  return data
}
