import { TicketCreateForm } from './components/ticket-create-form'
import { TicketCreateHeader } from './components/ticket-create-header'

export default function CriarChamadoPage() {
  return (
    <div className="page-content space-y-4 overflow-y-scroll pb-24">
      <TicketCreateHeader />
      <TicketCreateForm />
    </div>
  )
}
