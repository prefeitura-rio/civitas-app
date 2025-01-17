'use server'

import { api } from '@/lib/api'

export interface GetProfileResponse {
  id: string
  username: string
  full_name: string
  cpf: string
  registration: string
  agency: string
  sector: string
  email: string
  is_admin: boolean
}

export async function getProfile() {
  const response = await api.get<GetProfileResponse>('/users/me')

  return response.data
}
