'use client'

import { useQuery } from '@tanstack/react-query'
import { Eye, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { config } from '@/config'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { getUsersOnlyWithRoles } from '@/http/user-roles/get-users-only-with-roles'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

import { useChamadosImpersonation } from './chamados-impersonation-context'

/** Altura da barra fixa — manter igual ao `paddingTop` em `chamados/layout.tsx` */
export const CHAMADOS_IMPERSONATION_BAR_HEIGHT = '2.75rem'

/** Valor sentinela no Select (não pode ser UUID real). */
const IMPERSONATE_NONE_VALUE = '__civitas_impersonate_none__'

function formatRoles(roles: UserRoleListItem['roles']) {
  if (!roles?.length) return 'Sem perfil'
  return roles.join(' · ')
}

export function ChamadosImpersonationBar() {
  const { subjectUserId, setImpersonation, clearImpersonation } =
    useChamadosImpersonation()

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useProfile()

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['users-with-assigned-roles', 'chamados-impersonation'],
    queryFn: async () => {
      const res = await getUsersOnlyWithRoles()
      return res.data
    },
    enabled: config.enableImpersonation,
    staleTime: 60_000,
  })

  const selectableUsers = useMemo(
    () => (profile?.id ? users.filter((u) => u.id !== profile.id) : []),
    [users, profile?.id],
  )

  useEffect(() => {
    if (profile?.id && subjectUserId === profile.id) {
      clearImpersonation()
    }
  }, [profile?.id, subjectUserId, clearImpersonation])

  if (!config.enableImpersonation) {
    return null
  }

  const displayLabel = (u: UserRoleListItem) =>
    u.full_name?.trim() || u.username

  const control = (() => {
    if (isLoading || isProfileLoading) {
      return (
        <span className="text-xs text-muted-foreground">
          Carregando usuários…
        </span>
      )
    }
    if (isProfileError || !profile?.id) {
      return (
        <span className="text-xs text-destructive">
          Não foi possível identificar seu usuário. Atualize a página.
        </span>
      )
    }
    if (isError) {
      return (
        <span className="text-xs text-destructive">
          Não foi possível carregar a lista. Tente atualizar a página.
        </span>
      )
    }
    if (users.length === 0) {
      return (
        <span className="text-xs text-muted-foreground">
          Nenhum usuário com perfil atribuído — use a tela Perfis para habilitar
          a personificação.
        </span>
      )
    }
    if (selectableUsers.length === 0) {
      return (
        <span className="text-xs text-muted-foreground">
          Não há outros usuários com perfil para personificar.
        </span>
      )
    }
    return (
      <Select
        value={subjectUserId ?? IMPERSONATE_NONE_VALUE}
        onValueChange={(id) => {
          if (id === IMPERSONATE_NONE_VALUE) {
            clearImpersonation()
            return
          }
          const u = selectableUsers.find((x) => x.id === id)
          if (u) setImpersonation(u.id, displayLabel(u))
        }}
      >
        <SelectTrigger
          className="h-8 w-[min(18rem,calc(100vw-5rem))] min-w-[11rem] shrink-0 text-xs"
          aria-label="Escolher usuário para personificação"
        >
          <SelectValue placeholder="Escolher usuário…" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={6}>
          <SelectItem value={IMPERSONATE_NONE_VALUE} className="text-xs">
            Nenhum (sua visão)
          </SelectItem>
          {selectableUsers.map((u) => (
            <SelectItem key={u.id} value={u.id} className="text-xs">
              <span className="block font-medium leading-tight">
                {displayLabel(u)}
              </span>
              <span className="block truncate text-[0.7rem] leading-tight text-muted-foreground">
                {formatRoles(u.roles)}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  })()

  return (
    <div
      className="pointer-events-none fixed left-14 right-0 top-0 z-40 flex justify-end pr-2 sm:pr-3"
      style={{ minHeight: CHAMADOS_IMPERSONATION_BAR_HEIGHT }}
    >
      <div
        className="pointer-events-auto inline-flex max-w-[calc(100vw-3.5rem-1rem)] items-center gap-2 rounded-bl-md border border-t-0 border-border/60 bg-background/90 px-3 py-1.5 shadow-md backdrop-blur-md sm:gap-3 sm:px-4"
        style={{ minHeight: CHAMADOS_IMPERSONATION_BAR_HEIGHT }}
        role="region"
        aria-label="Personificação de usuário"
      >
        <Eye
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          Ver como
        </span>
        {control}
        {subjectUserId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearImpersonation}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Limpar
          </Button>
        ) : null}
      </div>
    </div>
  )
}
