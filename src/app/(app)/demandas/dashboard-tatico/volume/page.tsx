'use client'

import { DASHBOARD_DEMAND_VOLUME_SCREEN_CODE } from '@/app/(app)/demandas/dashboard-tatico/constants'
import { Spinner } from '@/components/custom/spinner'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { DemandVolumeView } from './components/demand-volume-view'

export default function DemandVolumePage() {
  const { allowed, resolved } = useTicketScreenPermissionGate(
    DASHBOARD_DEMAND_VOLUME_SCREEN_CODE,
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

  return <DemandVolumeView />
}
