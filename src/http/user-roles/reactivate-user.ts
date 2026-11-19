import { api } from '@/lib/api'

import type { UserActivation } from './deactivate-user'

export async function reactivateUser(userId: string) {
  const { data } = await api.patch<UserActivation>(
    `/users-roles/${encodeURIComponent(userId)}/reactivate`,
  )
  return data
}
