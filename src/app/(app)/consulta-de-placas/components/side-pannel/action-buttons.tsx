import { useCarPath } from '@/hooks/useCarPathContext'

import { MonitoringToggle } from './action-buttons/monitoring-toggle'
import DownloadReportButton from './action-buttons/report/download-report-button'

export function ActionButtons() {
  const { trips, isLoading, lastSearchParams } = useCarPath()

  const shouldShowDownloadReportButton =
    trips && trips?.length > 0 && !isLoading
  const shouldShowMonitoringToggle = lastSearchParams && !isLoading
  const shouldShowActionsSection =
    shouldShowDownloadReportButton || shouldShowMonitoringToggle
  return (
    <>
      {shouldShowActionsSection && (
        <div className="flex flex-col">
          <span className="text-center text-sm text-muted-foreground">
            Ações
          </span>
          <div className="mx-6 mb-2 flex gap-2 rounded-xl border p-2">
            {shouldShowDownloadReportButton && <DownloadReportButton />}
            {shouldShowMonitoringToggle && <MonitoringToggle />}
          </div>
        </div>
      )}
    </>
  )
}
