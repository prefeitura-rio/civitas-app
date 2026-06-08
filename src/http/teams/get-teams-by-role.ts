import { api } from '@/lib/api'

export type TeamIdNameOut = {
  id: string
  name: string
}

/** GET `/teams/by-role` */
export async function getTeamsByRole() {
  const { data } = await api.get<TeamIdNameOut[]>('/teams/by-role')
  return data
}
