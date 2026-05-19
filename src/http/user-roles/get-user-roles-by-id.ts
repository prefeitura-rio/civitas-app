import { api } from '@/lib/api'

import type { UserRole } from './get-users-with-roles'

export function getUserRolesById(userId: string) {
  return api.get<UserRole>(`/users-roles/${userId}`)
}
