'use client'

import '@/utils/date-extensions'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { toast } from 'sonner'

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
import { useReportsSearchParams } from '@/hooks/useParams/useReportsSearchParams'
import { useReportFilterOptions } from '@/hooks/useQueries/reports/use-report-filter-options'
import { useReportsTimeline } from '@/hooks/useQueries/reports/use-reports-timeline'
import { cn } from '@/lib/utils'

import { type ChartData, getChartData } from './actions'

interface TotalReportsTimeHistoryAreaChartProps {
  className?: string
}

export function TotalReportsTimeHistoryAreaChart({
  className,
}: TotalReportsTimeHistoryAreaChartProps) {
  const { formattedSearchParams } = useReportsSearchParams()
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})
  const [chartData, setChartData] = useState<ChartData[]>([])
  const { sources } = useReportFilterOptions()
  const { data: timelineData } = useReportsTimeline()

  useEffect(() => {
    if (sources && timelineData) {
      if (!formattedSearchParams.minDate || !formattedSearchParams.maxDate) {
        toast.error('Parâmetros de data inválidos')
        return
      }
      getChartData({
        timelineData,
        sources,
        start: formattedSearchParams.minDate,
        end: formattedSearchParams.maxDate,
      }).then((data) => setChartData(data))
    }
  }, [sources, timelineData])

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
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            {/* <defs>
              {sources?.map((item, index) => (
                <linearGradient
                  key={index}
                  id={`fill${item}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
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
            </defs> */}
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
                stackId={item}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
