'use client'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { TicketCreateForm } from './ticket-create/ticket-create-form'

const TICKET_CREATE_SCREEN_CODE = 'ticket_create'

function CriarChamadoPageContent() {
  return (
    <div
      className="page-content space-y-4 overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content">
        <TicketCreateForm />
      </div>
    </div>
  )
}

export default function CriarChamadoPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(
    TICKET_CREATE_SCREEN_CODE,
  )

  if (!resolved || !allowed) {
    return (
      <div
        className="page-content flex min-h-screen flex-col items-center justify-center pb-24"
        style={{ backgroundColor: '#0c161f' }}
      >
        <Spinner />
      </div>
    )
  }

  return <CriarChamadoPageContent />
}
