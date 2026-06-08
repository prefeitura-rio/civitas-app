import { api } from '@/lib/api'

import type { UserRole, UserRoleEnum } from './get-users-with-roles'

interface UpdateUserRolesRequest {
  userId: string
  role?: UserRoleEnum
}

export function updateUserRoles({ userId, role }: UpdateUserRolesRequest) {
  return api.put<UserRole>(`/users-roles/${userId}`, {
    role,
  })
}
