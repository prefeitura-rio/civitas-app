'use client'
import { useOperations } from '@/hooks/useContexts/use-operations-context'

import { DeleteOperationAlertDialog } from './components/delete-operation-alert-dialog'
import { OperationFormDialog } from './components/operation-form-dialog'

export function OperationDialogs() {
  const { deleteAlertDisclosure } = useOperations()
  return (
    <>
      <OperationFormDialog />
      <DeleteOperationAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
