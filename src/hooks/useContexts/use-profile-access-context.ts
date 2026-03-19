'use client'

import { useContext } from 'react'

import { ProfileAccessContext } from '@/contexts/profile-access-context'

export function useProfileAccess() {
  const context = useContext(ProfileAccessContext)

  if (!context) {
    throw new Error(
      'useProfileAccess must be used within a ProfileAccessProvider',
    )
  }

  return context
}
