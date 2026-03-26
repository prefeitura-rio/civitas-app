import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { config } from '@/config'

import { EmailToTicketView } from './components/email-to-ticket-view'

export default function ConverterChamadoPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <Suspense
      fallback={<div className="p-6 text-muted-foreground">Carregando…</div>}
    >
      <EmailToTicketView />
    </Suspense>
  )
}
