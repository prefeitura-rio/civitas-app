import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

import { MonitoringToggle } from './action-buttons/monitoring-toggle'
import DownloadReportButton from './action-buttons/report/download-report-button'

export function ActionButtons() {
  const { isLoading, lastSearchParams } = useCarPath()

  const shouldShowDownloadReportButton = lastSearchParams && !isLoading
  const shouldShowMonitoringToggle = lastSearchParams && !isLoading
  const shouldShowActionsSection =
    shouldShowDownloadReportButton || shouldShowMonitoringToggle

  return (
    <>
      {shouldShowActionsSection && (
        <div className="flex flex-col">
          <div className="box-border flex gap-2 rounded border p-1">
            {shouldShowDownloadReportButton && <DownloadReportButton />}
            {shouldShowMonitoringToggle && <MonitoringToggle />}
          </div>
        </div>
      )}
    </>
  )
}
