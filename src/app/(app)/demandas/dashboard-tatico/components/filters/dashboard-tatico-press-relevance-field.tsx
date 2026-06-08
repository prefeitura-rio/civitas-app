'use client'

import { Switch } from '@/components/ui/switch'

import styles from './dashboard-tatico-filter-modal.module.css'
import type { DashboardTaticoFilterScope } from './types'

const PRESS_RELEVANCE_FIELD_ID: Record<DashboardTaticoFilterScope, string> = {
  'operational-view': 'dashboard-tatico-relevante-imprensa-operational-view',
  'sla-metrics': 'dashboard-tatico-relevante-imprensa-sla-metrics',
  'demand-volume': 'dashboard-tatico-relevante-imprensa-demand-volume',
}

export type DashboardTaticoPressRelevanceFieldProps = {
  scope: DashboardTaticoFilterScope
  value: boolean
  onChange: (value: boolean) => void
}

export function DashboardTaticoPressRelevanceField({
  scope,
  value,
  onChange,
}: DashboardTaticoPressRelevanceFieldProps) {
  const fieldId = PRESS_RELEVANCE_FIELD_ID[scope]

  return (
    <div className={styles.filterBlock}>
      <span className={styles.filterLabel}>RELEVANTE PARA IMPRENSA?</span>
      <div className="flex items-center gap-2 pt-1">
        <Switch
          id={fieldId}
          size="sm"
          checked={value}
          onCheckedChange={onChange}
        />
        <label htmlFor={fieldId} className="text-sm text-[#91a6bc]">
          {value ? 'Sim' : 'Não'}
        </label>
      </div>
    </div>
  )
}
