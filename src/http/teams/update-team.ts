import { api } from '@/lib/api'

import type { TeamSimple } from './get-teams'

interface UpdateTeamRequest {
  teamId: string
  name?: string
  description?: string | null
  is_active?: boolean
  islands?: Array<{ id?: string; name: string; is_active: boolean }>
}

export function updateTeam({ teamId, ...data }: UpdateTeamRequest) {
  return api.put<TeamSimple>(`/teams/${teamId}`, data)
}
