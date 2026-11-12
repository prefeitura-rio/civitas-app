import { useQuery } from '@tanstack/react-query'

import { getUserRoleById } from '@/http/user-roles/get-user-role-by-id'

import { useProfile } from './useProfile'

/**
 * Perfil do usuário logado de verdade, mesmo durante a personificação: `/users/me` devolve sempre o usuário da
 * sessão, e o perfil é lido pelo id dele (a permissão por tela devolveria o do personificado).
 */
export function useOwnUserRole() {
  const { data: profile } = useProfile()
  return useQuery({
    queryKey: ['users-roles', 'own', profile?.id],
    queryFn: () => getUserRoleById(profile!.id),
    enabled: Boolean(profile?.id),
    select: (user) => user.role,
    staleTime: 60_000,
  })
}
