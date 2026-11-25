import { api } from '@/lib/api'

import type { UserActivation } from './deactivate-user'

/** Desativação atual com observação e autor; a API só responde a quem pode reativar o usuário. */
export async function getUserActivation(userId: string) {
  const { data } = await api.get<UserActivation>(
    `/users-roles/${encodeURIComponent(userId)}/activation`,
  )
  return data
}
