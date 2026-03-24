import { notFound } from 'next/navigation'

import { config } from '@/config'

import { TicketsGeneralList } from './list/tickets-general-list'

export default function ChamadosPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <div
      className="page-content space-y-4 overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <TicketsGeneralList />
    </div>
  )
}
