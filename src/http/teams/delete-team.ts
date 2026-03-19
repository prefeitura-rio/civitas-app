import { api } from '@/lib/api'

export function deleteTeam(teamId: string) {
  return api.delete(`/teams/${teamId}`)
}
