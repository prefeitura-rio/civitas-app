import { api } from '@/lib/api'

import type { UserRoleEnum, UserRoleListItem } from './get-users-with-roles'

export function getUsersOnlyWithRoles(params?: { role?: UserRoleEnum }) {
  return api.get<UserRoleListItem[]>('/users-roles/assigned', {
    params: params?.role ? { role: params.role } : undefined,
  })
}
