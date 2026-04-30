import { api } from '@/lib/api'

export type TeamMemberUserOut = {
  user_id: string
  user_name: string
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
