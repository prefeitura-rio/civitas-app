'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function useTicketsSearchParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('page_size') ?? '20')

  const formattedSearchParams = useMemo(() => {
    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      page_size: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    }
  }, [page, pageSize])

  const queryKey = useMemo(
    () => ['tickets', formattedSearchParams],
    [formattedSearchParams],
  )

  function handlePaginate(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    params.set('page_size', String(formattedSearchParams.page_size))
    router.replace(`${pathName}?${params.toString()}`)
  }

  function handleSetPageSize(nextSize: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1')
    params.set('page_size', String(nextSize))
    router.replace(`${pathName}?${params.toString()}`)
  }

  return { formattedSearchParams, queryKey, handlePaginate, handleSetPageSize }
}
