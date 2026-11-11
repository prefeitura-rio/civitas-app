'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { VEHICLE_INTELLIGENCE_BFF_PREFIX } from '@/lib/vehicle-intelligence/constants'

class BffError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`)
  }
}

async function fetchDashboard() {
  const response = await fetch(
    `${VEHICLE_INTELLIGENCE_BFF_PREFIX}/api/veiculos/v1/dashboard`,
    { headers: { Accept: 'application/json' } },
  )
  if (!response.ok) throw new BffError(response.status)
  return (await response.json()) as Record<string, unknown>
}

// Provisório, até o porte das telas: confirma sessão → BFF → serviço → banco.
export function ConnectionCheck() {
  const router = useRouter()
  const { data, error, isPending } = useQuery({
    queryKey: ['vehicle-intelligence', 'connection-check'],
    queryFn: fetchDashboard,
    retry: false,
  })
  const status = error instanceof BffError ? error.status : null

  useEffect(() => {
    if (status === 401) router.replace('/auth/sign-in')
    if (status === 403) router.replace('/forbidden')
  }, [status, router])

  return (
    <div className="page-content flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Inteligência Veicular</h1>
      {isPending && <p className="text-muted-foreground">Conectando…</p>}
      {error && (
        <p className="text-destructive">
          Não foi possível falar com o serviço ({error.message}).
        </p>
      )}
      {data && (
        <p className="text-muted-foreground">
          Serviço conectado: {Object.keys(data).length} seções do painel
          recebidas.
        </p>
      )}
    </div>
  )
}
