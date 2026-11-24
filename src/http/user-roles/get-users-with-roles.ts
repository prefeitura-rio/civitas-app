import { api } from '@/lib/api'

import type { UserStatusFilter } from './deactivation-reasons'

export type UserRoleEnum =
  | 'Coordenador'
  | 'Administrativo'
  | 'Analista'
  | 'Adjunto'
  | 'Auxiliar de Adjunto'
  | 'Assessor'
  | 'Líder de Ilha'
  | 'Agente'
  | 'Desenvolvedor'

export interface UserRoleListItem {
  id: string
  username: string
  full_name: string | null
  email: string | null
  role: UserRoleEnum | null
  /** `false` quando o usuário foi desativado na CIVITAS. */
  is_active: boolean
  /** Conta de integração: só um Desenvolvedor a altera. */
  is_service_account?: boolean
  /** Presente em `/users-roles/assigned`: indica se o usuário já está em alguma equipe. */
  belongs_to_team?: boolean
}

export interface UserRole extends UserRoleListItem {
  updated_at: string
}

interface GetUsersWithRolesRequest {
  page: number
  size: number
  /** Filtro de busca (query string `search` na API). */
  search?: string
  /** Padrão da API: `active`. */
  status?: UserStatusFilter
}

export interface GetUsersWithRolesResponse {
  items: UserRoleListItem[]
  total: number
}

export function getUsersWithRoles({
  page,
  size,
  search,
  status,
}: GetUsersWithRolesRequest) {
  return api.get<GetUsersWithRolesResponse>('/users-roles', {
    params: {
      page,
      page_size: size,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  })
}
