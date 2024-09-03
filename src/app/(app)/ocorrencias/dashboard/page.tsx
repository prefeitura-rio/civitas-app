import { Top5ReportTypesBarChart } from './components/top-5-report-types-bar-chart'
import { TotalReportsByOriginPieChart } from './components/total-reports-by-origin-pie-chart'
import { TotalReportsTimeHistoryAreaChart } from './components/total-reports-time-history-area-chart'

export default function Dashboard() {
  return (
    <div className="flex h-full w-full min-w-screen-md flex-col gap-2">
      <TotalReportsTimeHistoryAreaChart className="h-96" />
      <div className="flex h-96 gap-2">
        <Top5ReportTypesBarChart className="h-96 w-2/3 min-w-96" />
        <TotalReportsByOriginPieChart className="h-96 w-1/3 min-w-96" />
      </div>
    </div>
  )
}
