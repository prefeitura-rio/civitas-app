'use client'

import { DASHBOARD_SLA_SCREEN_CODE } from '@/app/(app)/demandas/dashboard-tatico/constants'
import { Spinner } from '@/components/custom/spinner'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { SlaMetricsView } from './components/sla-metrics-view'

export default function SlaMetricsPage() {
  const { allowed, resolved } = useTicketScreenPermissionGate(
    DASHBOARD_SLA_SCREEN_CODE,
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

  return <SlaMetricsView />
}
