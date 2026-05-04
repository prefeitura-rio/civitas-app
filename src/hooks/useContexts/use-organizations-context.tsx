import { useContext } from 'react'

import { OrganizationsContext } from '@/contexts/organizations-context'

export function useOrganizations() {
  return useContext(OrganizationsContext)
}
