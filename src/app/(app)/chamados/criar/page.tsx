import { TicketCreateForm } from './ticket-create/ticket-create-form'

export default function CriarChamadoPage() {
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
