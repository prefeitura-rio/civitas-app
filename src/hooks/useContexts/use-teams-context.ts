'use client'

import { useContext } from 'react'

import { TeamsContext } from '../../contexts/teams-context'

export function useTeams() {
  const context = useContext(TeamsContext)

  if (!context) {
    throw new Error('useTeams must be used within a TeamsProvider')
  }

  return context
}
