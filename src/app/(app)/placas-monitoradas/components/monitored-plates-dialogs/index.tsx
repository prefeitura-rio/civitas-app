'use client'

import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'

import { MonitoredPlateFormDialog } from '../../../components/monitored-plate-form-dialog'
import { DeleteMonitoredPlateAlertDialog } from './components/delete-monitored-plate-alert-dialog'

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
