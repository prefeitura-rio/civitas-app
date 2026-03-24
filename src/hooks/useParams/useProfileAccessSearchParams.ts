'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function useProfileAccessSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') || 1)
  const size = Number(searchParams.get('size') || 10)

  const formattedSearchParams = useMemo(
    () => ({
      page,
      size,
    }),
    [page, size],
  )

  const queryKey = useMemo(
    () => ['users-with-roles', formattedSearchParams],
    [formattedSearchParams],
  )

  function handlePaginate(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    params.set('size', String(size))

    router.push(`${pathname}?${params.toString()}`)
  }

  return {
    formattedSearchParams,
    queryKey,
    handlePaginate,
  }
}
