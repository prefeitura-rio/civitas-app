'use client'

// import { TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { Label, Pie, PieChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
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
import { getTimelineReports } from '@/http/reports/dashboard/get-timeline'
import { cn } from '@/lib/utils'

interface TotalReportsByOriginPieChartProps {
  className?: string
}

export function TotalReportsByOriginPieChart({
  className,
}: TotalReportsByOriginPieChartProps) {
  const { queryKey, formattedSearchParams } = useReportsSearchParams()
  const { data } = useQuery({
    queryKey: ['pie', ...queryKey],
    queryFn: async () => {
      const reports = await getTimelineReports(formattedSearchParams)

      console.log({ reports })

      const count = reports.reduce(
        (acc, cur) => {
          return {
            ...acc,
            [cur.source]: acc[cur.source] ? acc[cur.source] + cur.count : 1,
          }
        },
        {} as Record<string, number>,
      )

      const chartData = Object.entries(count).map(([source, count]) => ({
        source,
        count,
        fill: `var(--color-${source})`,
      }))

      const chartConfig = {
        ocorrencias: {
          label: 'Ocorrencias',
        },
      } as ChartConfig

      chartData.forEach((item, index) => {
        chartConfig[item.source] = {
          label: item.source,
          color: `hsl(var(--chart-${index + 1}))`,
        }
      })

      console.log({ count, chartData, chartConfig })

      return { count, chartData, chartConfig }
    },
  })

  return (
    <Card className={cn(className, 'flex flex-col')}>
      <CardHeader className="items-center pb-2">
        <CardTitle>Distribuição das Fontes de Ocorrências</CardTitle>
        <CardDescription>
          Gráfico de rosca mostrando a distribuição de ocorrências por fonte,
          com o total no centro.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-7.75rem)] p-0">
        {data && (
          <ChartContainer
            config={data.chartConfig}
            className="mx-auto aspect-square h-full [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data.chartData}
                dataKey="count"
                nameKey="source"
                innerRadius={50}
                strokeWidth={2}
                outerRadius={80}
                label
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {data.chartData
                              .reduce((acc, cur) => acc + cur.count, 0)
                              .toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Ocorrências
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="source" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Exibindo o total de ocorrências para os últimos 6 meses
        </div>
      </CardFooter> */}
    </Card>
  )
}
