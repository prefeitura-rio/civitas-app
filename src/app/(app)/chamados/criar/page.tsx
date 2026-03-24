import { notFound } from 'next/navigation'

import { config } from '@/config'

import { TicketCreateForm } from './ticket-create/ticket-create-form'

export default function CriarChamadoPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <div
      className="page-content flex flex-1 flex-col overflow-y-scroll"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="flex flex-1 flex-col gap-8 px-10 pb-10 pt-4">
        <TicketCreateForm />
      </div>
    </div>
  )
}
