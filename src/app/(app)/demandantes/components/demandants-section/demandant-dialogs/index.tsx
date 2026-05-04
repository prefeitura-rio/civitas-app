'use client'
import { useDemandantsContext } from '@/hooks/useContexts/use-demandants-context'

import { DeleteDemandantAlertDialog } from './delete-demandant-alert-dialog'
import { DemandantFormDialog } from './demandant-form-dialog'

export function DemandantDialogs() {
  const { formDialogDisclosure, deleteAlertDisclosure } = useDemandantsContext()

  return (
    <>
      <DemandantFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
      <DeleteDemandantAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
