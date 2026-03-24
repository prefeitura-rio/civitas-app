'use client'

import { createContext, type ReactNode, useMemo, useState } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

interface ProfileAccessContextData {
  formDialogDisclosure: ReturnType<typeof useDisclosure>
  dialogInitialData: UserRoleListItem | null
  setDialogInitialData: (value: UserRoleListItem | null) => void
}

export const ProfileAccessContext =
  createContext<ProfileAccessContextData | null>(null)

interface ProfileAccessProviderProps {
  children: ReactNode
}

export function ProfileAccessProvider({
  children,
}: ProfileAccessProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] =
    useState<UserRoleListItem | null>(null)

  const value = useMemo(
    () => ({
      formDialogDisclosure,
      dialogInitialData,
      setDialogInitialData,
    }),
    [formDialogDisclosure, dialogInitialData],
  )

  return (
    <ProfileAccessContext.Provider value={value}>
      {children}
    </ProfileAccessContext.Provider>
  )
}
