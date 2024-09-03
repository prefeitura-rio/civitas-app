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

// const chartData = [
//   { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
//   { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
// ]

const chartConfig = {
  ocorrencias: {
    label: 'Ocorrencias',
  },
  DD: {
    label: 'DD',
    color: 'hsl(var(--chart-1))',
  },
  appRio: {
    label: '1746',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface TotalReportsByOriginPieChartProps {
  className?: string
}

export function TotalReportsByOriginPieChart({
  className,
}: TotalReportsByOriginPieChartProps) {
  const { queryKey, formattedSearchParams } = useReportsSearchParams()
  const { data } = useQuery({
    queryKey: ['pie', ...queryKey],
    queryFn: () =>
      getTimelineReports(formattedSearchParams).then((data) => {
        const count = data.reduce(
          (acc, cur) => {
            if (cur.source === 'DD') {
              return {
                ...acc,
                DD: acc.DD + cur.count,
              }
            }
            if (cur.source === '1746') {
              return {
                ...acc,
                appRio: acc.appRio + cur.count,
              }
            }
            return acc
          },
          {
            DD: 0,
            appRio: 0,
          },
        )

        const chartData = [
          { source: 'DD', count: count.DD, fill: 'var(--color-DD)' },
          {
            source: 'appRio',
            count: count.appRio,
            fill: 'var(--color-appRio)',
          },
        ]
        console.log({ count, chartData })
        return { count, chartData }
      }),
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
            config={chartConfig}
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
                            {(
                              data.count.DD + data.count.appRio
                            ).toLocaleString()}
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
