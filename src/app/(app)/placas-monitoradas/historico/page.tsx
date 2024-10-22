import Breadcrumbs from './components/breadcrumbs'
import { HistoryFilter } from './components/filter'
import { HistoryTable } from './components/history-table'

export default function RequestsHistory() {
  return (
    <div className="page-content space-y-4 overflow-y-scroll">
      <h2>Placas Monitoradas</h2>
      <Breadcrumbs />
      <HistoryFilter />
      <HistoryTable />
    </div>
  )
}
