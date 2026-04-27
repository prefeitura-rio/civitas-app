'use client'
import { useOrganizations } from '@/hooks/useContexts/use-organizations-context'

import { DeleteOrganizationAlertDialog } from './delete-organization-alert-dialog'
import { OrganizationFormDialog } from './organization-form-dialog'

export function OrganizationDialogs() {
  const { formDialogDisclosure, deleteAlertDisclosure } = useOrganizations()

  return (
    <>
      <OrganizationFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
      <DeleteOrganizationAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
