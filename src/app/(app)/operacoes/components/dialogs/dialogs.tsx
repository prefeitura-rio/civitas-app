'use client'
import { useOperations } from '@/hooks/use-contexts/use-operations-context'

import { DeleteOperationAlertDialog } from './delete-operation-alert-dialog'
import { OperationFormDialog } from './operation-form-dialog'

export function Dialogs() {
  const { formDialogDisclosure, deleteAlertDisclosure } = useOperations()
  return (
    <>
      <OperationFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
      <DeleteOperationAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
