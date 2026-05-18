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

export function useCaixaEntradaSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const nlPage = parsePage(searchParams.get('nl_page'))
  const nlSize = parsePageSize(searchParams.get('nl_size'))
  const arPage = parsePage(searchParams.get('ar_page'))
  const arSize = parsePageSize(searchParams.get('ar_size'))

  const naoLidosParams = useMemo(
    () => ({ page: nlPage, size: nlSize }),
    [nlPage, nlSize],
  )

  const aguardandoParams = useMemo(
    () => ({ page: arPage, size: arSize }),
    [arPage, arSize],
  )

  const naoLidosQueryKey = useMemo(
    () => ['emails-inbox-nao-lidos', naoLidosParams],
    [naoLidosParams],
  )

  const aguardandoQueryKey = useMemo(
    () => ['emails-inbox-aguardando-resposta', aguardandoParams],
    [aguardandoParams],
  )

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        params.set(k, v)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams],
  )

  const handleNaoLidosPaginate = useCallback(
    (nextPage: number) => {
      pushParams({
        nl_page: String(nextPage),
        nl_size: String(nlSize),
      })
    },
    [nlSize, pushParams],
  )

  const handleAguardandoPaginate = useCallback(
    (nextPage: number) => {
      pushParams({
        ar_page: String(nextPage),
        ar_size: String(arSize),
      })
    },
    [arSize, pushParams],
  )

  return {
    naoLidos: {
      formattedSearchParams: naoLidosParams,
      queryKey: naoLidosQueryKey,
      handlePaginate: handleNaoLidosPaginate,
    },
    aguardando: {
      formattedSearchParams: aguardandoParams,
      queryKey: aguardandoQueryKey,
      handlePaginate: handleAguardandoPaginate,
    },
  }
}
