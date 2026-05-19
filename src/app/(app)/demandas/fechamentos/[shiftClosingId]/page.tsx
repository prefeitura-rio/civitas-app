'use client'

import { notFound, useParams } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { ShiftClosingView } from '../components/shift-closing-view'

const SHIFT_CLOSING_SCREEN_CODE = 'shift_closing'

function ShiftClosingDetailPageContent({
  shiftClosingId,
}: {
  shiftClosingId: string
}) {
  return (
    <div
      className="page-content space-y-4 overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content">
        <ShiftClosingView shiftClosingId={shiftClosingId} />
      </div>
    </div>
  )
}

export default function ShiftClosingDetailPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const params = useParams<{ shiftClosingId: string }>()
  const shiftClosingId = params.shiftClosingId

  const { allowed, resolved } = useTicketScreenPermissionGate(
    SHIFT_CLOSING_SCREEN_CODE,
  )

  if (!resolved || !allowed) {
    return (
      <div
        className="page-content flex min-h-screen flex-col items-center justify-center px-6 py-6"
        style={{ backgroundColor: '#0c161f' }}
      >
        <Spinner />
      </div>
    )
  }

  if (!shiftClosingId) {
    notFound()
  }

  return <ShiftClosingDetailPageContent shiftClosingId={shiftClosingId} />
}
