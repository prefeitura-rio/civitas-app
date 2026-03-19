'use client'

import { createContext, type ReactNode, useMemo, useState } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

interface TeamDialogInitialData {
  id?: string
  name?: string
  description?: string | null
  is_active?: boolean
}

interface TeamMemberDialogInitialData {
  id?: string
  team_id: string
  team_name: string
  user_id?: string
  user_name?: string | null
  island_id?: string | null
  island_name?: string | null
  role?: string
  is_active?: boolean
}

interface DeleteTeamProps {
  id: string
  name: string
}

interface DeleteTeamMemberProps {
  id: string
  user_name: string
  team_id: string
  team_name: string
}

interface TeamsContextData {
  teamFormDisclosure: ReturnType<typeof useDisclosure>
  memberFormDisclosure: ReturnType<typeof useDisclosure>

  teamDialogInitialData: TeamDialogInitialData | null
  setTeamDialogInitialData: (value: TeamDialogInitialData | null) => void

  memberDialogInitialData: TeamMemberDialogInitialData | null
  setMemberDialogInitialData: (
    value: TeamMemberDialogInitialData | null,
  ) => void

  deleteTeamProps: DeleteTeamProps | null
  setDeleteTeamProps: (value: DeleteTeamProps | null) => void

  deleteTeamMemberProps: DeleteTeamMemberProps | null
  setDeleteTeamMemberProps: (value: DeleteTeamMemberProps | null) => void
}

export const TeamsContext = createContext<TeamsContextData | null>(null)

interface TeamsProviderProps {
  children: ReactNode
}

export function TeamsProvider({ children }: TeamsProviderProps) {
  const teamFormDisclosure = useDisclosure()
  const memberFormDisclosure = useDisclosure()

  const [teamDialogInitialData, setTeamDialogInitialData] =
    useState<TeamDialogInitialData | null>(null)

  const [memberDialogInitialData, setMemberDialogInitialData] =
    useState<TeamMemberDialogInitialData | null>(null)

  const [deleteTeamProps, setDeleteTeamProps] =
    useState<DeleteTeamProps | null>(null)

  const [deleteTeamMemberProps, setDeleteTeamMemberProps] =
    useState<DeleteTeamMemberProps | null>(null)

  const value = useMemo(
    () => ({
      teamFormDisclosure,
      memberFormDisclosure,
      teamDialogInitialData,
      setTeamDialogInitialData,
      memberDialogInitialData,
      setMemberDialogInitialData,
      deleteTeamProps,
      setDeleteTeamProps,
      deleteTeamMemberProps,
      setDeleteTeamMemberProps,
    }),
    [
      teamFormDisclosure,
      memberFormDisclosure,
      teamDialogInitialData,
      memberDialogInitialData,
      deleteTeamProps,
      deleteTeamMemberProps,
    ],
  )

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
}
