import { api } from '@/lib/api'

import type { UserRoleListItem } from './get-users-with-roles'

export async function getUserRoleById(userId: string) {
  const { data } = await api.get<UserRoleListItem>(`/users-roles/${userId}`)
  return data
}
