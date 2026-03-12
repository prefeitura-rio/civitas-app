import { TicketCreateForm } from './components/ticket-create-form'
import { TicketCreateHeader } from './components/ticket-create-header'

export default function CriarChamadoPage() {
  return (
    <div
      className="page-content flex flex-1 flex-col overflow-y-scroll"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="flex flex-1 flex-col gap-8 px-10 pb-10 pt-4">
        <TicketCreateHeader />
        <TicketCreateForm />
      </div>
    </div>
  )
}
