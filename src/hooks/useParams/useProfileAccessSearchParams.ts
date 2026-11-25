'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import {
  DEACTIVATION_REASON_LABELS,
  type UserDeactivationReason,
  type UserStatusFilter,
} from '@/http/user-roles/deactivation-reasons'
import { USER_ROLES, type UserRoleEnum } from '@/http/user-roles/user-roles'

const STATUS_VALUES: UserStatusFilter[] = ['active', 'inactive', 'all']

/** Valor do filtro de perfil para quem ainda não tem perfil de acesso. */
export const WITHOUT_ROLE = 'none'

export type ProfileAccessFilterKey = 'role' | 'reason'

function parseStatus(value: string | null): UserStatusFilter {
  return STATUS_VALUES.includes(value as UserStatusFilter)
    ? (value as UserStatusFilter)
    : 'active'
}

function parseRole(
  value: string | null,
): UserRoleEnum | typeof WITHOUT_ROLE | '' {
  if (value === WITHOUT_ROLE) return WITHOUT_ROLE
  return USER_ROLES.includes(value as UserRoleEnum)
    ? (value as UserRoleEnum)
    : ''
}

function parseReason(value: string | null): UserDeactivationReason | '' {
  return value && value in DEACTIVATION_REASON_LABELS
    ? (value as UserDeactivationReason)
    : ''
}

export function useProfileAccessSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') || 1)
  const size = Number(searchParams.get('size') || 10)
  const search = (searchParams.get('search') ?? '').trim()
  const status = parseStatus(searchParams.get('status'))
  const role = parseRole(searchParams.get('role'))
  // Ativos não têm motivo de desativação.
  const reason =
    status === 'active' ? '' : parseReason(searchParams.get('reason'))

  const formattedSearchParams = useMemo(
    () => ({
      page,
      size,
      status,
      ...(search ? { search } : {}),
      ...(role === WITHOUT_ROLE ? { withoutRole: true } : role ? { role } : {}),
      ...(reason ? { reason } : {}),
    }),
    [page, size, status, search, role, reason],
  )

  const queryKey = useMemo(
    () => ['users-with-roles', formattedSearchParams],
    [formattedSearchParams],
  )

  const pushParams = useCallback(
    (update: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      update(params)
      params.set('page', '1')
      params.set('size', String(size))
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams, size],
  )

  const handlePaginate = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(nextPage))
      params.set('size', String(size))

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams, size],
  )

  const handleSearch = useCallback(
    (nextSearch: string) => {
      const trimmed = nextSearch.trim()
      pushParams((params) => {
        if (trimmed) params.set('search', trimmed)
        else params.delete('search')
      })
    },
    [pushParams],
  )

  const handleStatusChange = useCallback(
    (nextStatus: UserStatusFilter) => {
      pushParams((params) => {
        if (nextStatus === 'active') {
          params.delete('status')
          params.delete('reason')
        } else {
          params.set('status', nextStatus)
        }
      })
    },
    [pushParams],
  )

  const handleFilterChange = useCallback(
    (key: ProfileAccessFilterKey, value: string | null) => {
      pushParams((params) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
    },
    [pushParams],
  )

  return {
    search,
    status,
    role,
    reason,
    formattedSearchParams,
    queryKey,
    handlePaginate,
    handleSearch,
    handleStatusChange,
    handleFilterChange,
  }
}
