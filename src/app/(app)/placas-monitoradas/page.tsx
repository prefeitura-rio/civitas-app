import { Dialogs } from './components/monitored-plates-dialogs'
import { MonitoredPlatesFilter } from './components/monitored-plates-filter'
import { MonitoredPlatesHeader } from './components/monitored-plates-header'
import { MonitoredPlatesTable } from './components/monitored-plates-table'

export default function PlacasMonitoradas() {
  return (
    <div className="page-content space-y-4 overflow-y-scroll">
      <MonitoredPlatesHeader />
      <MonitoredPlatesFilter />
      <MonitoredPlatesTable />
      <Dialogs />
    </div>
  )
}
