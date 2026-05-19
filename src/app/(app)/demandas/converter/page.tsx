'use client'

import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { CHAMADOS_IMPERSONATION_BAR_HEIGHT } from '../chamados-impersonation-bar'
import { EmailToTicketView } from './components/email-to-ticket-view'

const TICKET_CONVERT_SCREEN_CODE = 'ticket_convert'

function ConverterChamadoPageContent() {
  return (
    <Suspense
      fallback={<div className="p-6 text-muted-foreground">Carregando…</div>}
    >
      <EmailToTicketView />
    </Suspense>
  )
}

export default function ConverterChamadoPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(
    TICKET_CONVERT_SCREEN_CODE,
  )

  if (!resolved || !allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <Spinner />
      </div>
    )
  }

  const shellHeight = config.enableImpersonation
    ? `calc(100dvh - ${CHAMADOS_IMPERSONATION_BAR_HEIGHT})`
    : '100dvh'

  return (
    <div
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
      style={{ height: shellHeight, maxHeight: shellHeight }}
    >
      <ConverterChamadoPageContent />
    </div>
  )
}
