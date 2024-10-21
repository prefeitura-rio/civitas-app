import { Card } from '@/components/ui/card'
import type { EnhancedDetectionDTO } from '@/hooks/use-queries/use-enhanced-radars-search'
import type { UseSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/use-search-by-radar-enhanced-result-dynamic-filter'

import { ClearTripsButton } from './components/clear-trips-button'
import { DownloadReport } from './components/download-report'

interface ActionBarProps {
  data: EnhancedDetectionDTO[] | undefined
  filters: UseSearchByRadarEnhancedResultDynamicFilter
  isLoading: boolean
}

export function ActionBar({ data, filters, isLoading }: ActionBarProps) {
  return (
    <Card className="flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReport
          data={data || []}
          filters={filters}
          isLoading={isLoading}
        />
      </div>
      <div className="flex gap-2">
        <ClearTripsButton />
      </div>
    </Card>
  )
}
