import { Dialogs } from './components/dialogs/dialogs'
import { MonitoredPlatesFilter } from './components/filter/monitored-plates-filter'
import { MonitoredPlatesHeader } from './components/header/monitored-plates-header'
import { MonitoredPlatesTable } from './components/table/monitored-plates-table'

export default function PlacasMonitoradas() {
  return (
    <div className="page-content space-y-4">
      <MonitoredPlatesHeader />
      <MonitoredPlatesFilter />
      <MonitoredPlatesTable />
      <Dialogs />
    </div>
  )
}
