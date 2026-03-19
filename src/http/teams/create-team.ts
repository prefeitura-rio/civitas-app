import { api } from '@/lib/api'

import type { TeamSimple } from './get-teams'

interface CreateTeamRequest {
  name: string
  description?: string | null
  is_active?: boolean
}

export function createTeam(data: CreateTeamRequest) {
  return api.post<TeamSimple>('/teams/', data)
}
