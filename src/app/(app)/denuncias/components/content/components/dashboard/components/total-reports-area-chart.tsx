'use client'
import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

const chartData = [
  { date: '2024-04-01', 'Disque Denúncia': 222, 1746: 150 },
  { date: '2024-04-02', 'Disque Denúncia': 97, 1746: 180 },
  { date: '2024-04-03', 'Disque Denúncia': 167, 1746: 120 },
  { date: '2024-04-04', 'Disque Denúncia': 242, 1746: 260 },
  { date: '2024-04-05', 'Disque Denúncia': 373, 1746: 290 },
  { date: '2024-04-06', 'Disque Denúncia': 301, 1746: 340 },
  { date: '2024-04-07', 'Disque Denúncia': 245, 1746: 180 },
  { date: '2024-04-08', 'Disque Denúncia': 409, 1746: 320 },
  { date: '2024-04-09', 'Disque Denúncia': 59, 1746: 110 },
  { date: '2024-04-10', 'Disque Denúncia': 261, 1746: 190 },
  { date: '2024-04-11', 'Disque Denúncia': 327, 1746: 350 },
  { date: '2024-04-12', 'Disque Denúncia': 292, 1746: 210 },
  { date: '2024-04-13', 'Disque Denúncia': 342, 1746: 380 },
  { date: '2024-04-14', 'Disque Denúncia': 137, 1746: 220 },
  { date: '2024-04-15', 'Disque Denúncia': 120, 1746: 170 },
  { date: '2024-04-16', 'Disque Denúncia': 138, 1746: 190 },
  { date: '2024-04-17', 'Disque Denúncia': 446, 1746: 360 },
  { date: '2024-04-18', 'Disque Denúncia': 364, 1746: 410 },
  { date: '2024-04-19', 'Disque Denúncia': 243, 1746: 180 },
  { date: '2024-04-20', 'Disque Denúncia': 89, 1746: 150 },
  { date: '2024-04-21', 'Disque Denúncia': 137, 1746: 200 },
  { date: '2024-04-22', 'Disque Denúncia': 224, 1746: 170 },
  { date: '2024-04-23', 'Disque Denúncia': 138, 1746: 230 },
  { date: '2024-04-24', 'Disque Denúncia': 387, 1746: 290 },
  { date: '2024-04-25', 'Disque Denúncia': 215, 1746: 250 },
  { date: '2024-04-26', 'Disque Denúncia': 75, 1746: 130 },
  { date: '2024-04-27', 'Disque Denúncia': 383, 1746: 420 },
  { date: '2024-04-28', 'Disque Denúncia': 122, 1746: 180 },
  { date: '2024-04-29', 'Disque Denúncia': 315, 1746: 240 },
  { date: '2024-04-30', 'Disque Denúncia': 454, 1746: 380 },
  { date: '2024-05-01', 'Disque Denúncia': 165, 1746: 220 },
  { date: '2024-05-02', 'Disque Denúncia': 293, 1746: 310 },
  { date: '2024-05-03', 'Disque Denúncia': 247, 1746: 190 },
  { date: '2024-05-04', 'Disque Denúncia': 385, 1746: 420 },
  { date: '2024-05-05', 'Disque Denúncia': 481, 1746: 390 },
  { date: '2024-05-06', 'Disque Denúncia': 498, 1746: 520 },
  { date: '2024-05-07', 'Disque Denúncia': 388, 1746: 300 },
  { date: '2024-05-08', 'Disque Denúncia': 149, 1746: 210 },
  { date: '2024-05-09', 'Disque Denúncia': 227, 1746: 180 },
  { date: '2024-05-10', 'Disque Denúncia': 293, 1746: 330 },
  { date: '2024-05-11', 'Disque Denúncia': 335, 1746: 270 },
  { date: '2024-05-12', 'Disque Denúncia': 197, 1746: 240 },
  { date: '2024-05-13', 'Disque Denúncia': 197, 1746: 160 },
  { date: '2024-05-14', 'Disque Denúncia': 448, 1746: 490 },
  { date: '2024-05-15', 'Disque Denúncia': 473, 1746: 380 },
  { date: '2024-05-16', 'Disque Denúncia': 338, 1746: 400 },
  { date: '2024-05-17', 'Disque Denúncia': 499, 1746: 420 },
  { date: '2024-05-18', 'Disque Denúncia': 315, 1746: 350 },
  { date: '2024-05-19', 'Disque Denúncia': 235, 1746: 180 },
  { date: '2024-05-20', 'Disque Denúncia': 177, 1746: 230 },
  { date: '2024-05-21', 'Disque Denúncia': 82, 1746: 140 },
  { date: '2024-05-22', 'Disque Denúncia': 81, 1746: 120 },
  { date: '2024-05-23', 'Disque Denúncia': 252, 1746: 290 },
  { date: '2024-05-24', 'Disque Denúncia': 294, 1746: 220 },
  { date: '2024-05-25', 'Disque Denúncia': 201, 1746: 250 },
  { date: '2024-05-26', 'Disque Denúncia': 213, 1746: 170 },
  { date: '2024-05-27', 'Disque Denúncia': 420, 1746: 460 },
  { date: '2024-05-28', 'Disque Denúncia': 233, 1746: 190 },
  { date: '2024-05-29', 'Disque Denúncia': 78, 1746: 130 },
  { date: '2024-05-30', 'Disque Denúncia': 340, 1746: 280 },
  { date: '2024-05-31', 'Disque Denúncia': 178, 1746: 230 },
  { date: '2024-06-01', 'Disque Denúncia': 178, 1746: 200 },
  { date: '2024-06-02', 'Disque Denúncia': 470, 1746: 410 },
  { date: '2024-06-03', 'Disque Denúncia': 103, 1746: 160 },
  { date: '2024-06-04', 'Disque Denúncia': 439, 1746: 380 },
  { date: '2024-06-05', 'Disque Denúncia': 88, 1746: 140 },
  { date: '2024-06-06', 'Disque Denúncia': 294, 1746: 250 },
  { date: '2024-06-07', 'Disque Denúncia': 323, 1746: 370 },
  { date: '2024-06-08', 'Disque Denúncia': 385, 1746: 320 },
  { date: '2024-06-09', 'Disque Denúncia': 438, 1746: 480 },
  { date: '2024-06-10', 'Disque Denúncia': 155, 1746: 200 },
  { date: '2024-06-11', 'Disque Denúncia': 92, 1746: 150 },
  { date: '2024-06-12', 'Disque Denúncia': 492, 1746: 420 },
  { date: '2024-06-13', 'Disque Denúncia': 81, 1746: 130 },
  { date: '2024-06-14', 'Disque Denúncia': 426, 1746: 380 },
  { date: '2024-06-15', 'Disque Denúncia': 307, 1746: 350 },
  { date: '2024-06-16', 'Disque Denúncia': 371, 1746: 310 },
  { date: '2024-06-17', 'Disque Denúncia': 475, 1746: 520 },
  { date: '2024-06-18', 'Disque Denúncia': 107, 1746: 170 },
  { date: '2024-06-19', 'Disque Denúncia': 341, 1746: 290 },
  { date: '2024-06-20', 'Disque Denúncia': 408, 1746: 450 },
  { date: '2024-06-21', 'Disque Denúncia': 169, 1746: 210 },
  { date: '2024-06-22', 'Disque Denúncia': 317, 1746: 270 },
  { date: '2024-06-23', 'Disque Denúncia': 480, 1746: 530 },
  { date: '2024-06-24', 'Disque Denúncia': 132, 1746: 180 },
  { date: '2024-06-25', 'Disque Denúncia': 141, 1746: 190 },
  { date: '2024-06-26', 'Disque Denúncia': 434, 1746: 380 },
  { date: '2024-06-27', 'Disque Denúncia': 448, 1746: 490 },
  { date: '2024-06-28', 'Disque Denúncia': 149, 1746: 200 },
  { date: '2024-06-29', 'Disque Denúncia': 103, 1746: 160 },
  { date: '2024-06-30', 'Disque Denúncia': 446, 1746: 400 },
]
const chartConfig = {
  'Disque Denúncia': {
    label: 'Disque Denúncia',
    color: 'hsl(var(--chart-1))',
  },
  1746: {
    label: '1746',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface TotalReportsAreaChartProps {
  className?: string
}

export function TotalReportsAreaChart({
  className,
}: TotalReportsAreaChartProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <CardTitle>Total de Denúncias</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="fillDisqueDenuncia"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={chartConfig['Disque Denúncia'].color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig['Disque Denúncia'].color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fill1746" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig['1746'].color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig['1746'].color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('pt-BR', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('pt-BR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="Disque Denúncia"
              type="natural"
              fill={'url(#fillDisqueDenuncia)'}
              stroke={chartConfig['Disque Denúncia'].color}
              stackId="a"
            />
            <Area
              dataKey="1746"
              type="natural"
              fill="url(#fill1746)"
              stroke="var(--color-1746)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
