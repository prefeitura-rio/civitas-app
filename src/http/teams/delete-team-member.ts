import { api } from '@/lib/api'

export function deleteTeamMember(memberId: string) {
  return api.delete(`/teams/members/${memberId}`)
}
