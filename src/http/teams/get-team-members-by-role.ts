import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { api } from '@/lib/api'

export type TeamMemberUserOut = {
  user_id: string
  user_name: string
  role: UserRoleEnum | null
}

type GetTeamMembersByRoleParams = {
  team_id?: string
}

/** GET `/teams/members/by-role` */
export async function getTeamMembersByRole(
  params: GetTeamMembersByRoleParams = {},
) {
  const { data } = await api.get<TeamMemberUserOut[]>(
    '/teams/members/by-role',
    {
      params: params.team_id ? params : undefined,
    },
  )
  return data
}
