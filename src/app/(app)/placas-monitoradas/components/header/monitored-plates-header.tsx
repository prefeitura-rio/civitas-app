'use client'
import { Button } from '@/components/ui/button'
import { useMonitoredPlates } from '@/hooks/use-monitored-plates'

export function MonitoredPlatesHeader() {
  const { formDialogDisclosure } = useMonitoredPlates()

  return (
    <div className="flex w-full justify-between">
      <h1 className="text-3xl font-semibold tracking-tight">
        Placas Monitoradas
      </h1>
      <Button onClick={formDialogDisclosure.onOpen}>Adicionar</Button>
    </div>
  )
}
