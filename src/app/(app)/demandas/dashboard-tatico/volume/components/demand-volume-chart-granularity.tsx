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

const GRANULARITY_OPTIONS: {
  value: DemandVolumeGranularity
  label: string
}[] = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
]

interface DemandVolumeChartGranularityProps {
  value: DemandVolumeGranularity
  onChange: (value: DemandVolumeGranularity) => void
  disabled?: boolean
}

export function DemandVolumeChartGranularity({
  value,
  onChange,
  disabled,
}: DemandVolumeChartGranularityProps) {
  return (
    <div className={styles.pageSelectWrapCompact}>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(v) => onChange(v as DemandVolumeGranularity)}
      >
        <SelectTrigger
          className={`h-11 w-full ${styles.pageSelectTrigger}`}
          aria-label="Agrupamento do gráfico"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={styles.selectContentForm}>
          {GRANULARITY_OPTIONS.map((opt) => (
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
