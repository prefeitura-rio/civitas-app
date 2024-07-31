import { cn } from '@/lib/utils'

import { Top5EventTypesBarChart } from './components/top-5-event-types-bar-chart'
import { TotalReportsByOriginPieChart } from './components/total-events-by-origin-pie-chart'
import { TotalEventsTimeHistoryAreaChart } from './components/total-events-time-history-area-chart'

interface DashboardProps {
  className?: string
}

export function Dashboard({ className }: DashboardProps) {
  return (
    <div className={cn(className, 'grid grid-cols-3 gap-2')}>
      <TotalEventsTimeHistoryAreaChart className="col-span-3" />
      <Top5EventTypesBarChart className="col-span-1" />
      <TotalReportsByOriginPieChart className="col-span-1" />
    </div>
  )
}
