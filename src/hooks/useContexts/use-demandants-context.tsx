import { useContext } from 'react'

import { DemandantsContext } from '@/contexts/demandants-context'

export function useDemandantsContext() {
  return useContext(DemandantsContext)
}
