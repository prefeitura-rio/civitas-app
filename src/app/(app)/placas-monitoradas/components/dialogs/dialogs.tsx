'use client'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'

import { DeleteMonitoredPlateAlertDialog } from './delete-monitored-plate-alert-dialog'
import { MonitoredPlateFormDialog } from './monitored-plate-form-dialog'

export function Dialogs() {
  const { formDialogDisclosure, deleteAlertDisclosure } = useMonitoredPlates()
  return (
    <>
      <MonitoredPlateFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
      <DeleteMonitoredPlateAlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        onClose={deleteAlertDisclosure.onClose}
        onOpen={deleteAlertDisclosure.onOpen}
      />
    </>
  )
}
