import { cn } from '@/lib/utils'

import { Top5EventTypesBarChart } from './components/top-5-event-types-bar-chart'
import { TotalReportsByOriginPieChart } from './components/total-events-by-origin-pie-chart'
import { TotalEventsTimeHistoryAreaChart } from './components/total-events-time-history-area-chart'

interface DashboardProps {
  className?: string
}

export function Dashboard({ className }: DashboardProps) {
  return (
    <div className={cn(className, 'flex h-[calc(100%-0rem)] flex-col gap-2')}>
      <TotalEventsTimeHistoryAreaChart className="h-96" />
      <div className="flex h-96 gap-2">
        <Top5EventTypesBarChart className="h-96 w-2/3 min-w-96" />
        <TotalReportsByOriginPieChart className="h-96 w-1/3 min-w-96" />
      </div>
    </div>
  )
}
