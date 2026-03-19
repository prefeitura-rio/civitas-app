import { api } from '@/lib/api'

export type UserRoleEnum =
  | 'Coordenador'
  | 'Administrativo'
  | 'Adjunto'
  | 'Líder de Ilha'
  | 'Operador'

export interface UserRoleListItem {
  id: string
  username: string
  full_name: string | null
  email: string | null
  roles: UserRoleEnum[]
}

export interface UserRole extends UserRoleListItem {
  updated_at: string
}

interface GetUsersWithRolesRequest {
  page: number
  size: number
}

export interface GetUsersWithRolesResponse {
  items: UserRoleListItem[]
  total: number
}

export function getUsersWithRoles({ page, size }: GetUsersWithRolesRequest) {
  return api.get<GetUsersWithRolesResponse>('/users-roles', {
    params: {
      page,
      page_size: size,
    },
  })
}
