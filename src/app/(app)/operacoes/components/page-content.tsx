'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useOperations } from '@/hooks/use-operations'

import { OperationsHeader } from './header/operations-header'
import { OperationsTable } from './table/operations-table'

export default function PageContent() {
  const { createDialogDisclosure } = useOperations()

  return (
    <div className="page-content">
      <OperationsHeader />
      <OperationsTable />

      <Dialog
        open={createDialogDisclosure.isOpen}
        onOpenChange={createDialogDisclosure.onOpenChange}
      >
        <DialogContent></DialogContent>
      </Dialog>
    </div>
  )
}
