import { useMap } from '@/hooks/use-contexts/use-map-context'
import { cn } from '@/lib/utils'

import { ClearTripsButton } from './action-buttons/clear-trips-button'
import { MonitoringToggle } from './action-buttons/monitoring-toggle'
import DownloadReportButton from './action-buttons/report/download-report-button'

export function ActionButtons() {
  const {
    layers: {
      trips: { trips, lastSearchParams, isLoading, possiblePlates },
    },
  } = useMap()
  const downloadReportButton = lastSearchParams && !isLoading && trips
  const monitoringToggle = lastSearchParams && !isLoading && trips
  const clearTripsButton =
    ((lastSearchParams && trips) || possiblePlates) && !isLoading
  const empty = !downloadReportButton && !monitoringToggle && !clearTripsButton

  return (
    <div
      className={cn(
        'flex h-11 items-center gap-2 rounded bg-secondary p-1',
        empty ? 'hidden' : '',
      )}
    >
      {downloadReportButton && <DownloadReportButton />}
      {monitoringToggle && <MonitoringToggle />}
      {clearTripsButton && (
        <div className="flex w-full justify-end">
          <ClearTripsButton />
        </div>
      )}
    </div>
  )
}
