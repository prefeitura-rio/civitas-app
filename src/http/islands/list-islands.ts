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

export function listIslands(params?: ListIslandsParams) {
  return api.get<ListIslandsResponse>('/islands/', {
    params: {
      search: params?.search,
      isActive: params?.isActive,
    },
  })
}
