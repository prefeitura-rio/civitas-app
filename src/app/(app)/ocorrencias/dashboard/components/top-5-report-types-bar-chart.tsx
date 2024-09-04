'use client'

// import { TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useReportsSearchParams } from '@/hooks/use-params/use-reports-search-params'
import { getTopSubtypes } from '@/http/reports/dashboard/get-top-subtypes'
import { cn } from '@/lib/utils'

// const chartData = [
//   { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
//   { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
//   { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
//   { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
//   { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
// ]

// const chartConfig = {
//   visitors: {
//     label: 'Visitors',
//   },
//   chrome: {
//     label: 'Chrome',
//     color: 'hsl(var(--chart-1))',
//   },
//   safari: {
//     label: 'Safari',
//     color: 'hsl(var(--chart-2))',
//   },
//   firefox: {
//     label: 'Firefox',
//     color: 'hsl(var(--chart-3))',
//   },
//   edge: {
//     label: 'Edge',
//     color: 'hsl(var(--chart-4))',
//   },
//   other: {
//     label: 'Other',
//     color: 'hsl(var(--chart-5))',
//   },
// } satisfies ChartConfig

interface Top5ReportTypesBarChartProps {
  className?: string
}

export function Top5ReportTypesBarChart({
  className,
}: Top5ReportTypesBarChartProps) {
  const { queryKey, formattedSearchParams } = useReportsSearchParams()
  const { data } = useQuery({
    queryKey: ['top-subtypes', ...queryKey],
    queryFn: () =>
      getTopSubtypes(formattedSearchParams).then((data) => {
        const chartData = data.map((item) => {
          const key = item.subtype.replaceAll(' ', '-')
          return {
            subtype: key,
            label: item.subtype,
            count: item.count,
            fill: `var(--color-${key})`,
          }
        })

        let chartConfig: ChartConfig = {}

        chartData.forEach((item, index) => {
          const key = item.subtype.replaceAll(' ', '-')

          chartConfig = {
            count: {
              label: 'Ocorrências',
            },
            ...chartConfig,
            [key]: {
              label: item.subtype,
              color: `hsl(var(--chart-${index + 1}))`,
            },
          }
        })

        return {
          chartData,
          chartConfig,
        }
      }),
  })
  return (
    <Card className={cn(className)}>
      <CardHeader className="">
        <CardTitle>Top 5 Subtipos de Ocorrências</CardTitle>
        <CardDescription>
          Gráfico de barras horizontais comparando os cinco tipos de reportes
          mais comuns.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-6.125rem)] w-full">
        {data && (
          <ChartContainer config={data.chartConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              data={data.chartData}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                // tickFormatter={(value) => data.chartConfig[value].label}
                hide
              />
              <XAxis dataKey="count" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="count" layout="vertical" radius={5}>
                <LabelList
                  dataKey="label"
                  position="insideLeft"
                  offset={8}
                  className="fill-[--color-label]"
                  fontSize={12}
                />
                <LabelList
                  dataKey="count"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
