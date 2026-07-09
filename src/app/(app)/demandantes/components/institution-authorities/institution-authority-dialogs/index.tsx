'use client'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'

import { DeleteInstitutionAuthorityAlertDialog } from './components/delete-institution-authority-alert-dialog'
import { InstitutionAuthorityFormDialog } from './components/institution-authority-form-dialog'

export function InstitutionAuthorityDialogs() {
  const { formDialogDisclosure, deleteAlertDisclosure } =
    useInstitutionAuthorities()

  return (
    <>
      <InstitutionAuthorityFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
      <DeleteInstitutionAuthorityAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
