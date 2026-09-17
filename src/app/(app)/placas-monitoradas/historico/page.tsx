import Breadcrumbs from './components/breadcrumbs'
import { HistoryFilter } from './components/filter'
import { HistoryTable } from './components/history-table'

export default function RequestsHistory() {
  return (
    <div className="page-content space-y-4 overflow-y-scroll">
      <Breadcrumbs />
      <h2>Histórico de placas monitoradas</h2>
      <HistoryFilter />
      <HistoryTable />
    </div>
  )
}
