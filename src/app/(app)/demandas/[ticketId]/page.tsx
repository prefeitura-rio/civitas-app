import { notFound } from 'next/navigation'

import { config } from '@/config'

import { TicketDetailView } from './components/ticket-detail-view'

type PageProps = {
  params: Promise<{ ticketId: string }>
}

export default async function ChamadoDetalhePage({ params }: PageProps) {
  if (!config.enableChamados) {
    notFound()
  }

  const { ticketId } = await params

  return (
    <div
      className="page-content overflow-y-auto"
      style={{ backgroundColor: '#0c161f' }}
    >
      <TicketDetailView ticketId={ticketId} />
    </div>
  )
}
