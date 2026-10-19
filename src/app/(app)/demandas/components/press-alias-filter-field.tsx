'use client'

import styles from '@/app/(app)/demandas/list/components/filter/tickets-general-list-filters.module.css'
import { Switch } from '@/components/ui/switch'

const FIELD_ID = 'press-alias-filter'

interface PressAliasFilterFieldProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function PressAliasFilterField({
  value,
  onChange,
}: PressAliasFilterFieldProps) {
  return (
    <div className={styles.filterBlock}>
      <span className={styles.filterLabel}>RELEVANTE PARA IMPRENSA?</span>
      <div className="flex items-center gap-2 pt-1">
        <Switch
          id={FIELD_ID}
          size="sm"
          checked={value}
          onCheckedChange={onChange}
        />
        <label htmlFor={FIELD_ID} className="text-sm text-[#91a6bc]">
          {value ? 'Sim' : 'Não'}
        </label>
      </div>
    </div>
  )
}
