import { useCallback, useState } from 'react'

import type { DashboardTaticoAdvancedFilterForm } from './types'

export function usePersistedAdvancedFilters<
  T extends DashboardTaticoAdvancedFilterForm,
>(createInitialForm: () => T) {
  const [form, setForm] = useState(createInitialForm)

  const applyAdvancedFilters = useCallback(
    (next: T, onApply: (filters: T) => void) => {
      setForm(next)
      onApply(next)
    },
    [],
  )

  return { form, applyAdvancedFilters }
}
