import { useContext } from 'react'

import { OperationsContext } from '@/contexts/operations-context'

export function useOperations() {
  const operationsContext = useContext(OperationsContext)
  return operationsContext
}
