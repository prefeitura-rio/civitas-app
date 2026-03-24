import { api } from '@/lib/api'

import type { UserRoleEnum } from '../user-roles/get-users-with-roles'
import type { TeamMember } from './get-teams'

interface CreateTeamMemberRequest {
  user_id: string
  team_id: string
  island_id?: string | null
  role: UserRoleEnum
  is_active?: boolean
}

export function createTeamMember(data: CreateTeamMemberRequest) {
  return api.post<TeamMember>('/teams/members', data)
}
