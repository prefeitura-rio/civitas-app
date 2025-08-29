import { Card } from '@/components/ui/card'
import type { UseSearchByPlateResultDynamicFilter } from '@/hooks/useSearchByPlateResultDynamicFilter'

import { ClearTripsButton } from '../../../veiculo/components/action-bar/components/clear-trips-button'
import { EnhancePlatesInfo } from './components/enhance-plates-info'

interface ActionBarProps {
  isLoading: boolean
  filters: UseSearchByPlateResultDynamicFilter
  data: string[]
}

export function ActionBar({ filters, isLoading, data }: ActionBarProps) {
  return (
    <Card className="mx-auto flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <EnhancePlatesInfo
          isLoading={isLoading}
          plates={data}
          filters={filters}
        />
      </div>
      <div className="flex gap-2">
        <ClearTripsButton />
      </div>
    </Card>
  )
}
