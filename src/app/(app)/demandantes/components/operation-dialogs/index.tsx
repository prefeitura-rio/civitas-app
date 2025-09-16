'use client'
import { useOperations } from '@/hooks/useContexts/use-operations-context'

import { DeleteOperationAlertDialog } from './components/delete-operation-alert-dialog'
import { OperationFormDialog } from './components/operation-form-dialog'

export function OperationDialogs() {
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
