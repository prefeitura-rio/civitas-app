import { api } from '@/lib/api'

import type { UserRoleEnum } from '../user-roles/get-users-with-roles'
import type { TeamMember } from './get-teams'

interface UpdateTeamMemberRequest {
  memberId: string
  island_id?: string | null
  role?: UserRoleEnum
  is_active?: boolean
}

export function updateTeamMember({
  memberId,
  ...data
}: UpdateTeamMemberRequest) {
  return api.put<TeamMember>(`/teams/members/${memberId}`, data)
}
