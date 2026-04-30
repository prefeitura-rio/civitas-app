'use client'

import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

import { ProfileAccessFormDialog } from './profile-access-form-dialog'

interface ProfileAccessDialogsProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  dialogInitialData: UserRoleListItem | null
  setDialogInitialData: (value: UserRoleListItem | null) => void
}

export function ProfileAccessDialogs({
  isOpen,
  onOpen,
  onClose,
  dialogInitialData,
  setDialogInitialData,
}: ProfileAccessDialogsProps) {
  return (
    <ProfileAccessFormDialog
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      dialogInitialData={dialogInitialData}
      setDialogInitialData={setDialogInitialData}
    />
  )
}
