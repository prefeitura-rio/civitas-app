import { Card } from '@/components/ui/card'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/use-search-by-radar-result-dynamic-filter'

import { ClearTripsButton } from '../../../resultado-enriquecido/components/action-bar/components/clear-trips-button'
import { DownloadReport } from './components/download-report'
import { EnhancePlatesInfo } from './components/enhance-plates-info'

interface ActionBarProps {
  isLoading: boolean
  filters: UseSearchByRadarResultDynamicFilter
  data: DetectionDTO[] | undefined
}

export function ActionBar({ isLoading, filters, data }: ActionBarProps) {
  return (
    <Card className="flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReport
          data={data || []}
          filters={filters}
          isLoading={isLoading}
        />
        <EnhancePlatesInfo
          isLoading={isLoading}
          plates={data?.map((item) => item.plate) || []}
          filters={filters}
          data={data}
        />
      </div>
      <div className="flex gap-2">
        <ClearTripsButton />
      </div>
    </Card>
  )
}
