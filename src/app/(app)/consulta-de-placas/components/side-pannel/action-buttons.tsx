import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { cn } from '@/lib/utils'

import { MonitoringToggle } from './action-buttons/monitoring-toggle'
import DownloadReportButton from './action-buttons/report/download-report-button'

export function ActionButtons() {
  const { isLoading, lastSearchParams, trips } = useCarPath()

  const shouldShowDownloadReportButton = lastSearchParams && !isLoading && trips
  const shouldShowMonitoringToggle = lastSearchParams && !isLoading && trips
  const shouldShowActionsSection =
    shouldShowDownloadReportButton || shouldShowMonitoringToggle

  return (
    <>
      <div className="flex flex-col">
        <div
          className={cn(
            'flex h-11 items-center gap-2 rounded bg-secondary p-1',
            shouldShowActionsSection
              ? ''
              : 'justify-center border border-secondary bg-transparent',
          )}
        >
          {!shouldShowActionsSection && (
            <span className="text-center text-sm text-muted">
              Nenhuma ação disponível
            </span>
          )}
          {shouldShowDownloadReportButton && <DownloadReportButton />}
          {shouldShowMonitoringToggle && <MonitoringToggle />}
        </div>
      </div>
    </>
  )
}
