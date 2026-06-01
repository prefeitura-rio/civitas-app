'use client'

import { DASHBOARD_OPERATIONAL_VIEW_SCREEN_CODE } from '@/app/(app)/demandas/dashboard-tatico/constants'
import { Spinner } from '@/components/custom/spinner'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { OperationalViewView } from './components/operational-view-view'

export default function OperationalViewPage() {
  const { allowed, resolved } = useTicketScreenPermissionGate(
    DASHBOARD_OPERATIONAL_VIEW_SCREEN_CODE,
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

  return <OperationalViewView />
}
