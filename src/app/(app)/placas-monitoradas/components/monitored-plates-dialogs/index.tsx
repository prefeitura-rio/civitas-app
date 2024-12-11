'use client'
import { OperationsContextProvider } from '@/contexts/operations-context'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'

import { MonitoredPlateFormDialog } from '../../../components/monitored-plate-form-dialog'
import { DeleteMonitoredPlateAlertDialog } from './components/delete-monitored-plate-alert-dialog'

export function Dialogs() {
  const { formDialogDisclosure, deleteAlertDisclosure } = useMonitoredPlates()
  return (
    <>
      <OperationsContextProvider>
        <MonitoredPlateFormDialog
          isOpen={formDialogDisclosure.isOpen}
          onClose={formDialogDisclosure.onClose}
          onOpen={formDialogDisclosure.onOpen}
        />
      </OperationsContextProvider>
      <DeleteMonitoredPlateAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
