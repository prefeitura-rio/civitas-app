import { Dialogs } from './components/dialogs/dialogs'
import { MonitoredPlatesHeader } from './components/header/monitored-plates-header'
import { MonitoredPlatesTable } from './components/table/monitored-plates-table'

export default function PlacasMonitoradas() {
  return (
    <div className="page-content">
      <MonitoredPlatesHeader />
      <MonitoredPlatesTable />

      <Dialogs />
    </div>
  )
}
