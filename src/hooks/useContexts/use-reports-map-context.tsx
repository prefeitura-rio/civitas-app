import { useContext } from 'react'

import { ReportsMapContext } from '@/contexts/reports-map-context'

export function useReportsMap() {
  const reportsMapContext = useContext(ReportsMapContext)
  return reportsMapContext
}
