'use client'
import { useRequestingInstitutions } from '@/hooks/useContexts/use-requesting-institutions-context'

import { DeleteRequestingInstitutionAlertDialog } from './components/delete-requesting-institution-alert-dialog'
import { RequestingInstitutionFormDialog } from './components/requesting-institution-form-dialog'

export function RequestingInstitutionDialogs() {
  const { formDialogDisclosure, deleteAlertDisclosure } =
    useRequestingInstitutions()

  return (
    <>
      <RequestingInstitutionFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
      <DeleteRequestingInstitutionAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
