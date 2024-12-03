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
  console.log({ timelineData })
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

  console.log({ auxData })

  const currentDate = new Date(start)
  const endDt = new Date(end)
  const chartData: ChartData[] = []

  while (currentDate.getTime() <= endDt.getTime()) {
    const date = formatDate(currentDate, 'dd/MM/y')

    const counts = sources.reduce(
      (acc, cur) => {
        if (date === '14/08/2024') {
          console.log({ acc, cur, auxData })
          console.log({ A: auxData[date] })
          console.log({ B: auxData[date]?.[cur] })
        }

        return {
          ...acc,
          [cur]: auxData[date]?.[cur] || 0,
        }
      },
      {} as { [source: string]: number },
    )

    if (date === '14/08/2024') {
      console.log({ counts })
    }

    const entry: ChartData = {
      date,
      ...counts,
    }
    chartData.push(entry)

    currentDate.setDate(currentDate.getDate() + 1)
  }
  console.log({ chartData })

  return chartData
}
