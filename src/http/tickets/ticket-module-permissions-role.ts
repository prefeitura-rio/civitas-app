import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { api } from '@/lib/api'

export interface TicketModulePermissionAction {
  code: string
  label: string
  is_active: boolean
}

export interface TicketModulePermissionScreenCatalogItem {
  screen_code: string
  screen_label: string
  is_active: boolean
  actions: TicketModulePermissionAction[]
}

export interface TicketModuleRolePermissionItem {
  screen_code: string
  screen_label: string
  can_view: boolean
  allowed_action_codes: string[]
}

export interface GetTicketModulePermissionsByRoleResponse {
  role: UserRoleEnum
  screens_catalog: TicketModulePermissionScreenCatalogItem[]
  permissions: TicketModuleRolePermissionItem[]
}

export interface UpdateTicketModulePermissionByRoleItem {
  screen_code: string
  can_view: boolean
  allowed_action_codes: string[]
}

export interface UpdateTicketModulePermissionsByRoleRequest {
  permissions: UpdateTicketModulePermissionByRoleItem[]
}

export async function getTicketModulePermissionsByRole(role: UserRoleEnum) {
  const { data } = await api.get<GetTicketModulePermissionsByRoleResponse>(
    `/ticket-module-permissions/roles/${encodeURIComponent(role)}`,
  )

  return data
}

export async function updateTicketModulePermissionsByRole(
  role: UserRoleEnum,
  payload: UpdateTicketModulePermissionsByRoleRequest,
) {
  const { data } = await api.put<GetTicketModulePermissionsByRoleResponse>(
    `/ticket-module-permissions/roles/${encodeURIComponent(role)}`,
    payload,
  )

  return data
}
