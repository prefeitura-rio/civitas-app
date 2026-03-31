'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export function useProfileAccessSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') || 1)
  const size = Number(searchParams.get('size') || 10)
  const search = (searchParams.get('search') ?? '').trim()

  const formattedSearchParams = useMemo(
    () => ({
      page,
      size,
      ...(search ? { search } : {}),
    }),
    [page, size, search],
  )

  const queryKey = useMemo(
    () => ['users-with-roles', formattedSearchParams],
    [formattedSearchParams],
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
      const params = new URLSearchParams(searchParams.toString())
      if (trimmed) {
        params.set('search', trimmed)
      } else {
        params.delete('search')
      }
      params.set('page', '1')
      params.set('size', String(size))
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams, size],
  )

  return {
    search,
    formattedSearchParams,
    queryKey,
    handlePaginate,
    handleSearch,
  }
}
