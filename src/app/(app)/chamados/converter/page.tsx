import { notFound } from 'next/navigation'

import { config } from '@/config'

import { EmailToTicketView } from './components/email-to-ticket-view'

export default function ConverterChamadoPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return <EmailToTicketView />
}
