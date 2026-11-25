'use client'

import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

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

  const shellHeight = 'calc(100dvh - var(--impersonation-bar-height, 0px))'

  return (
    <div
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
      style={{ height: shellHeight, maxHeight: shellHeight }}
    >
      <ConverterChamadoPageContent />
    </div>
  )
}
