import { formatDate } from 'date-fns'

import type { TimelineGraphRecord } from '@/http/reports/dashboard/get-timeline'

type AuxData = {
  [date: string]: {
    [source: string]: number
  }
}

export type ChartData = {
  date: string
  [sourceId: string]: number | string
}

interface getChartDataProps {
  sources: string[]
  timelineData: TimelineGraphRecord[]
  start: string
  end: string
}

export async function getChartData({
  timelineData,
  sources,
  start,
  end,
}: getChartDataProps) {
  const auxData = timelineData.reduce((acc, cur) => {
    const date = formatDate(cur.date, 'dd/MM/y')
    return {
      ...acc,
      [date]: {
        ...acc[date],
        [cur.source]: cur.count,
      },
    }
  }, {} as AuxData)

  const currentDate = new Date(start)
  const endDt = new Date(end)
  const chartData: ChartData[] = []

  while (currentDate.getTime() <= endDt.getTime()) {
    const date = formatDate(currentDate, 'dd/MM/y')

    const counts = sources.reduce(
      (acc, cur) => {
        return {
          ...acc,
          [cur]: auxData[date]?.[cur] || 0,
        }
      },
      {} as { [source: string]: number },
    )

    const entry: ChartData = {
      date,
      ...counts,
    }
    chartData.push(entry)

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return chartData
}
