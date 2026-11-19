import { api } from '@/lib/api'

import type { UserStatusFilter } from './deactivation-reasons'
import type { UserRoleEnum, UserRoleListItem } from './get-users-with-roles'

export function getUsersOnlyWithRoles(params?: {
  role?: UserRoleEnum
  /** Padrão da API: `active`. */
  status?: UserStatusFilter
}) {
  const query = {
    ...(params?.role ? { role: params.role } : {}),
    ...(params?.status ? { status: params.status } : {}),
  }
  return api.get<UserRoleListItem[]>('/users-roles/assigned', {
    params: Object.keys(query).length ? query : undefined,
  })
}
