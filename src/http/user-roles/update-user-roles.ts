import { api } from '@/lib/api'

import type { UserRole, UserRoleEnum } from './get-users-with-roles'

interface UpdateUserRolesRequest {
  userId: string
  roles: UserRoleEnum[]
}

export function updateUserRoles({ userId, roles }: UpdateUserRolesRequest) {
  return api.put<UserRole>(`/users-roles/${userId}`, {
    roles,
  })
}
