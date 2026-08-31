import { useContext } from 'react'

import { InstitutionAuthoritiesContext } from '@/contexts/institution-authorities-context'

export function useInstitutionAuthorities() {
  return useContext(InstitutionAuthoritiesContext)
}
