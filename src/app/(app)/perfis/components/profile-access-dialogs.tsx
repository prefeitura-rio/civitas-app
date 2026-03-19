'use client'

import { useProfileAccess } from '@/hooks/useContexts/use-profile-access-context'

import { ProfileAccessFormDialog } from './profile-access-form-dialog'

export function ProfileAccessDialogs() {
  const { formDialogDisclosure } = useProfileAccess()

  return (
    <ProfileAccessFormDialog
      isOpen={formDialogDisclosure.isOpen}
      onOpen={formDialogDisclosure.onOpen}
      onClose={formDialogDisclosure.onClose}
    />
  )
}
