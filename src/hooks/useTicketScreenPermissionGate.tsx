'use client'

import { getCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useResolvedTicketModulePermissions } from '@/hooks/useQueries/useResolvedTicketModulePermissions'
import {
  canViewTicketScreen,
  parseTicketModulePermissionsCookie,
  TICKET_MODULE_PERMISSIONS_COOKIE,
} from '@/http/tickets/ticket-module-permissions-me'

/**
 * Resolve permissões (cookie ou API) e redireciona para `/forbidden` se
 * `can_view` for falso para o `screenCode` informado.
 */
export function useTicketScreenPermissionGate(screenCode: string) {
  const router = useRouter()
  const fromCookie = parseTicketModulePermissionsCookie(
    getCookie(TICKET_MODULE_PERMISSIONS_COOKIE) as string | undefined,
  )
  const { permissions, resolved } =
    useResolvedTicketModulePermissions(fromCookie)

  const allowed = resolved && canViewTicketScreen(permissions, screenCode)

  useEffect(() => {
    if (!resolved) return
    if (!canViewTicketScreen(permissions, screenCode)) {
      router.replace('/forbidden')
    }
  }, [resolved, permissions, router, screenCode])

  return { allowed, resolved }
}
