'use client'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { DashboardTaticoTabs } from './components/dashboard-tatico-tabs'
import { TACTICAL_DASHBOARD_SCREEN_CODE } from './constants'

export default function DashboardTaticoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(
    TACTICAL_DASHBOARD_SCREEN_CODE,
  )

  if (!resolved || !allowed) {
    return (
      <div
        className="flex min-h-[240px] items-center justify-center"
        style={{ backgroundColor: '#0c161f' }}
      >
        <Spinner />
      </div>
    )
  }

  return (
    <div
      className="page-content overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content px-10 pb-10 pt-6">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: '#f9fafa', lineHeight: '40px' }}
          >
            Dashboard Tático
          </h1>
          <p className="text-xs" style={{ color: '#97a2ab' }}>
            Dashboard de métricas e indicadores de desempenho
          </p>
          <DashboardTaticoTabs />
          {children}
        </div>
      </div>
    </div>
  )
}
