import { api } from '@/lib/api'

import type { UserRoleListItem } from './get-users-with-roles'

export function getUsersOnlyWithRoles() {
  return api.get<UserRoleListItem[]>('/users-roles/assigned')
}
