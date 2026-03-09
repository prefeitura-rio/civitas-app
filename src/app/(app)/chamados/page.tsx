import { TicketsHeader } from './components/tickets-header'
import { TicketsTable } from './components/tickets-table'

export default function ChamadosPage() {
  return (
    <div className="page-content space-y-4 overflow-y-scroll">
      <TicketsHeader />
      {/* <TicketsFilter /> */}
      <TicketsTable />
    </div>
  )
}
