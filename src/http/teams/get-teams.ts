import { api } from '@/lib/api'

import type { UserRoleEnum } from '../user-roles/get-users-with-roles'

export interface TeamMember {
  id: string
  created_at: string
  team_id: string
  team_name: string
  user_id: string
  user_name: string | null
  island_id: string | null
  island_name: string | null
  is_active: boolean
  role: UserRoleEnum
}

export interface Team {
  id: string
  created_at: string
  name: string
  description: string | null
  is_active: boolean
  members: TeamMember[]
}

export interface TeamListResponse {
  items: Team[]
  total: number
}

export interface TeamSimple {
  id: string
  created_at: string
  name: string
  description: string | null
  is_active: boolean
}

export interface TeamsListSimpleResponse {
  id: string
  name: string
}

export function getTeamsList() {
  return api.get<TeamsListSimpleResponse[]>('/teams/')
}

export function getTeams() {
  return api.get<TeamListResponse>('/teams/with-members')
}
