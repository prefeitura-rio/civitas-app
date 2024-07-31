import { cn } from '@/lib/utils'

import { Top5TypesBarChart } from './components/top-5-types-bar-chart'
import { TotalReportsAreaChart } from './components/total-reports-area-chart'
import { TotalReportsByOriginPieChart } from './components/total-reports-by-origin-pie-chart'

interface DashboardProps {
  className?: string
}

export function Dashboard({ className }: DashboardProps) {
  return (
    <div className={cn(className, 'grid h-[48rem] grid-cols-3 gap-2')}>
      <TotalReportsAreaChart className="col-span-3" />
      <Top5TypesBarChart className="col-span-2" />
      <TotalReportsByOriginPieChart className="col-span-1" />
    </div>
  )
}
