'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DemandVolumeGranularity } from '@/http/tickets/get-demand-volume'

import styles from './demand-volume-top.module.css'

type ChartGranularityBase = 'monthly' | 'weekly' | 'yearly'

const BASE_GRANULARITY_OPTIONS: {
  value: ChartGranularityBase
  label: string
}[] = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
]

interface DemandVolumeChartGranularityProps<
  T extends ChartGranularityBase | 'daily' = DemandVolumeGranularity,
> {
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  includeDaily?: boolean
}

export function DemandVolumeChartGranularity<
  T extends ChartGranularityBase | 'daily' = DemandVolumeGranularity,
>({
  value,
  onChange,
  disabled,
  includeDaily,
}: DemandVolumeChartGranularityProps<T>) {
  const granularityOptions = includeDaily
    ? [
        { value: 'daily' as const, label: 'Diário' },
        ...BASE_GRANULARITY_OPTIONS,
      ]
    : BASE_GRANULARITY_OPTIONS
  return (
    <div className={styles.pageSelectWrapCompact}>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(v) => onChange(v as T)}
      >
        <SelectTrigger
          className={`h-11 w-full ${styles.pageSelectTrigger}`}
          aria-label="Agrupamento do gráfico"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={styles.selectContentForm}>
          {granularityOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className={styles.selectItemForm}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
