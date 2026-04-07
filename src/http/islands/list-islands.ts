import { api } from '@/lib/api'

export interface IslandListItem {
  id: string
  created_at: string
  name: string
  is_active: boolean
}

export interface ListIslandsResponse {
  items: IslandListItem[]
  total: number
}

interface ListIslandsParams {
  search?: string
  isActive?: boolean
}

/** Ilhas do time (IslandPageOut no backend). */
export function listIslandsByTeam(teamId: string, params?: ListIslandsParams) {
  return api.get<ListIslandsResponse>(`/islands/team/${teamId}`, {
    params: {
      search: params?.search,
      isActive: params?.isActive,
    },
  })
}
