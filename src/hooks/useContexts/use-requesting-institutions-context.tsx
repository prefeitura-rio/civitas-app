import { useContext } from 'react'

import { RequestingInstitutionsContext } from '@/contexts/requesting-institutions-context'

export function useRequestingInstitutions() {
  return useContext(RequestingInstitutionsContext)
}
