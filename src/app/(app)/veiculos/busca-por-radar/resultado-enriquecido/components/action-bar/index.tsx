import { Card } from '@/components/ui/card'
import type { EnhancedDetectionDTO } from '@/hooks/useQueries/useEnhancedRadarsSearch'
import type { UseSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/useSearchByRadarEnhancedResultDynamicFilter'

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
