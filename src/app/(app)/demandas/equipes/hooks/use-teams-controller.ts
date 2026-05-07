'use client'

import { useState } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

export interface TeamDialogIslandInitialData {
  id?: string
  name?: string
  is_active?: boolean
}

export interface TeamDialogInitialData {
  id?: string
  name?: string
  is_active?: boolean
  islands?: TeamDialogIslandInitialData[]
}

export interface TeamMemberDialogInitialData {
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

export interface DeleteTeamProps {
  id: string
  name: string
}

export interface DeleteTeamMemberProps {
  id: string
  user_name: string
  team_id: string
  team_name: string
}

export function useTeamsController() {
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

  function openCreateTeamDialog() {
    setTeamDialogInitialData(null)
    teamFormDisclosure.onOpen()
  }

  function openEditTeamDialog(data: TeamDialogInitialData) {
    setTeamDialogInitialData(data)
    teamFormDisclosure.onOpen()
  }

  function closeTeamDialog() {
    teamFormDisclosure.onClose()
    setTeamDialogInitialData(null)
  }

  function openCreateMemberDialog(data: TeamMemberDialogInitialData) {
    setMemberDialogInitialData(data)
    memberFormDisclosure.onOpen()
  }

  function openEditMemberDialog(data: TeamMemberDialogInitialData) {
    setMemberDialogInitialData(data)
    memberFormDisclosure.onOpen()
  }

  function closeMemberDialog() {
    memberFormDisclosure.onClose()
    setMemberDialogInitialData(null)
  }

  function openDeleteTeamMemberDialog(data: DeleteTeamMemberProps) {
    setDeleteTeamMemberProps(data)
  }

  function closeDeleteTeamMemberDialog() {
    setDeleteTeamMemberProps(null)
  }

  function openDeleteTeamDialog(data: DeleteTeamProps) {
    setDeleteTeamProps(data)
  }

  function closeDeleteTeamDialog() {
    setDeleteTeamProps(null)
  }

  return {
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

    openCreateTeamDialog,
    openEditTeamDialog,
    closeTeamDialog,

    openCreateMemberDialog,
    openEditMemberDialog,
    closeMemberDialog,

    openDeleteTeamMemberDialog,
    closeDeleteTeamMemberDialog,

    openDeleteTeamDialog,
    closeDeleteTeamDialog,
  }
}

export type TeamsController = ReturnType<typeof useTeamsController>
