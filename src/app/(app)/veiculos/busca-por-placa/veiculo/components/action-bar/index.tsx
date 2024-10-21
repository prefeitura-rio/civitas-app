import { Card } from '@/components/ui/card'

import { ClearTripsButton } from './components/clear-trips-button'
import { DownloadReportDialog } from './components/download-report-dialog'
import { MonitoringToggle } from './components/monitoring-toggle'

export function ActionBar() {
  return (
    <Card className="mx-auto flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReportDialog />
        <MonitoringToggle />
      </div>
      <div className="flex gap-2">
        <ClearTripsButton />
      </div>
    </Card>
  )
}
