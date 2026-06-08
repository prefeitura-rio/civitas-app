'use client'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { TicketsGeneralList } from './list/tickets-general-list'

const GENERAL_LIST_SCREEN_CODE = 'general_list'

function GeneralListPageContent() {
  return (
    <div
      className="page-content space-y-4 overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content">
        <TicketsGeneralList />
      </div>
    </div>
  )
}

export default function ChamadosPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(
    GENERAL_LIST_SCREEN_CODE,
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

  return <GeneralListPageContent />
}
