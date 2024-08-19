'use client'

import { formatDate } from 'date-fns'
import * as React from 'react'
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
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'
import { useReportFilterOptions } from '@/hooks/use-queries/use-report-filter-options'
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
  const [chartData, setChartData] = React.useState<ChartData[]>([])
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({})

  const {
    layers: {
      reports: { data },
    },
  } = useReportsMap()
  const { sources } = useReportFilterOptions()

  React.useEffect(() => {
    if (data && sources) {
      const hash: { [date: string]: { [sourceId: string]: number } } = {}

      data.forEach((item) => {
        const { date, sourceId } = item

        // Initialize date entry if not present
        if (!hash[date]) {
          hash[date] = {}
        }

        // Initialize sourceId entry if not present
        if (!hash[date][sourceId]) {
          hash[date][sourceId] = 0
        }

        // Increment the count for this date and sourceId
        hash[date][sourceId] += 1
      })

      // Convert grouped data to ChartData format
      const newChartData: ChartData[] = Object.entries(hash).map(
        ([date, sourceCounts]) => {
          const chartDataEntry: ChartData = { date }

          sources.forEach((sourceId) => {
            chartDataEntry[sourceId] = sourceCounts[sourceId] || 0
          })

          return chartDataEntry
        },
      )

      setChartData(newChartData)

      const chartConfig: ChartConfig = {}

      sources.forEach((item, index) => {
        chartConfig[item] = {
          label: item,
          color: `hsl(var(--chart-${index + 1}))`,
        }
      })

      setChartConfig(chartConfig)
    }
  }, [data, sources])

  console.log({ chartConfig, data, sources })

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
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={'date'}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatDate(value, 'dd/MM/yyyy')}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value, 'dd/MM/y')}
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
