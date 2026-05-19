'use client'

import { useQuery } from '@tanstack/react-query'
import { getCookie } from 'cookies-next'

import {
  getEffectiveTicketModulePermissionsFromCookie,
  getTicketModulePermissionsImpersonationQuerySegment,
  getTicketModulePermissionsMe,
  type TicketModulePermissionsMeOut,
} from '@/http/tickets/ticket-module-permissions-me'

const E2E_FAKE_TOKEN = 'fake-test-token-for-e2e'

const emptyPermissions = (): TicketModulePermissionsMeOut => ({
  screens: [],
  role: null,
})

export function useResolvedTicketModulePermissions(
  fromCookie: TicketModulePermissionsMeOut | null,
) {
  const effectiveFromCookie =
    getEffectiveTicketModulePermissionsFromCookie(fromCookie)

  const token =
    typeof window !== 'undefined'
      ? (getCookie('token') as string | undefined)
      : undefined
  const isE2EFake = token === E2E_FAKE_TOKEN

  const impersonationSegment =
    getTicketModulePermissionsImpersonationQuerySegment()

  const query = useQuery({
    queryKey: [
      'tickets',
      'module-screen-permissions',
      'me',
      impersonationSegment,
    ],
    queryFn: getTicketModulePermissionsMe,
    enabled:
      effectiveFromCookie === null &&
      !isE2EFake &&
      typeof window !== 'undefined',
    staleTime: Infinity,
    gcTime: 86_400_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (effectiveFromCookie !== null) {
    return { permissions: effectiveFromCookie, resolved: true as const }
  }

  if (isE2EFake) {
    return { permissions: emptyPermissions(), resolved: true as const }
  }

  if (query.isPending) {
    return { permissions: undefined, resolved: false as const }
  }

  if (query.isError) {
    return { permissions: emptyPermissions(), resolved: true as const }
  }

  return {
    permissions: query.data,
    resolved: true as const,
  }
}
