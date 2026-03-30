'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

const DEFAULT_PAGE = 1
const DEFAULT_SIZE = 10

function parsePage(value: string | null): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE
  return Math.floor(n)
}

function parsePageSize(value: string | null): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_SIZE
  return Math.min(100, Math.max(1, Math.floor(n)))
}

export function useSpamSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = parsePage(searchParams.get('page'))
  const size = parsePageSize(searchParams.get('size'))

  const formattedSearchParams = useMemo(() => ({ page, size }), [page, size])

  const queryKey = useMemo(
    () => ['emails-spam', formattedSearchParams],
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

  return {
    formattedSearchParams,
    queryKey,
    handlePaginate,
  }
}
