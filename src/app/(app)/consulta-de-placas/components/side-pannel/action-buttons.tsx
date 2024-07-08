import { useCarPath } from '@/hooks/useCarPathContext'

import { MonitoringToggle } from './action-buttons/monitoring-toggle'
import DownloadReportButton from './action-buttons/report/download-report-button'

export function ActionButtons() {
  const { trips, lastSearchParams, isLoading } = useCarPath()

  return (
    <>
      {((trips && trips?.length > 0) || lastSearchParams) && !isLoading && (
        <div className="flex flex-col">
          <span className="text-center text-sm text-muted-foreground">
            Ações
          </span>
          <div className="mx-6 mb-2 flex gap-2 rounded-xl border p-2">
            {trips && trips?.length > 0 && !isLoading && (
              <DownloadReportButton />
            )}
            {lastSearchParams && !isLoading && <MonitoringToggle />}
          </div>
        </div>
      )}
    </>
  )
}
