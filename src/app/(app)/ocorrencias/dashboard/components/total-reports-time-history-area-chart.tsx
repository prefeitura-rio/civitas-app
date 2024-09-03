'use client'

import '@/utils/date-extensions'

import { useQuery } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useReportsSearchParams } from '@/hooks/use-params/use-reports-search-params'
import { useReportFilterOptions } from '@/hooks/use-queries/use-report-filter-options'
import { getTimelineReports } from '@/http/reports/dashboard/get-timeline'
import { cn } from '@/lib/utils'

interface TotalReportsTimeHistoryAreaChartProps {
  className?: string
}

interface ChartData {
  date: string
  [sourceId: string]: number | string
}

export function TotalReportsTimeHistoryAreaChart({
  className,
}: TotalReportsTimeHistoryAreaChartProps) {
  const { queryKey, formattedSearchParams } = useReportsSearchParams()
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})
  const { sources } = useReportFilterOptions()

  const { data } = useQuery({
    queryKey: ['graph1', ...queryKey],
    queryFn: () =>
      getTimelineReports(formattedSearchParams).then((data) => {
        const formattedData: { [key: string]: ChartData } = {}
        const dateMap: { [key: string]: { [source: string]: number } } = {}
        const from = new Date(formattedSearchParams.minDate || '')
        const to = new Date(formattedSearchParams.maxDate || '')

        // Build a map for quick lookup of existing data
        data.forEach((entry) => {
          const { date, source, count } = entry
          if (!dateMap[date]) {
            dateMap[date] = {}
          }
          dateMap[date][source] = count
        })

        // Iterate through each day in the date range
        for (let date = new Date(from); date <= to; date = date.addDays(1)) {
          const dateString = date.toISOString().split('T')[0] + 'T00:00:00' // Ensure date format matches

          // Initialize the formatted entry for this date
          const entry: ChartData = { date: formatDate(dateString, 'dd/MM/y') }

          // For each source, check if we have data, if not add count = 0
          sources?.forEach((source) => {
            entry[source] = dateMap[dateString]?.[source] || 0
          })

          // Add to formatted data
          formattedData[dateString] = entry
        }

        // Convert the formattedData object into an array of objects
        return Object.values(formattedData)
      }),
  })

  useEffect(() => {
    if (sources) {
      const chartConfig: ChartConfig = {}

      sources.forEach((item, index) => {
        chartConfig[item] = {
          label: item,
          color: `hsl(var(--chart-${index + 1}))`,
        }
      })

      setChartConfig(chartConfig)
    }
  }, [sources])

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            Número Total de Ocorrências ao Longo do Tempo por Fonte
          </CardTitle>
          <CardDescription>
            Gráfico de área mostrando o total de ocorrências ao longo do tempo,
            dividido por fonte.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-6rem)] px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <defs>
              {sources?.map((item) => (
                <linearGradient id={`fill${item}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${item})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${item})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey={'date'}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              // tickFormatter={(value) => formatDate(value, 'dd/MM/yyyy')}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  // labelFormatter={(value) => formatDate(value, 'dd/MM/y')}
                  indicator="dot"
                />
              }
            />
            {sources?.map((item, index) => (
              <Area
                key={index}
                dataKey={item}
                type="natural"
                fill={`url(#fill${item})`}
                stroke={`var(--color-${item})`}
                stackId="a"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
