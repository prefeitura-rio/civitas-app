import { api } from '@/lib/api'

import type {
  UserDeactivationReason,
  UserStatusFilter,
} from './deactivation-reasons'
import type { UserRoleEnum } from './user-roles'

export type { UserRoleEnum } from './user-roles'

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
  /** Só para inativos: data e motivo da desativação atual. */
  deactivated_at?: string | null
  deactivation_reason?: UserDeactivationReason | null
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
  role?: UserRoleEnum
  /** Só usuários sem perfil de acesso. */
  withoutRole?: boolean
  /** Motivo da desativação atual; a API devolve só inativos. */
  reason?: UserDeactivationReason
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
  role,
  withoutRole,
  reason,
}: GetUsersWithRolesRequest) {
  return api.get<GetUsersWithRolesResponse>('/users-roles', {
    params: {
      page,
      page_size: size,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(withoutRole ? { without_role: true } : {}),
      ...(reason ? { reason } : {}),
    },
  })
}
