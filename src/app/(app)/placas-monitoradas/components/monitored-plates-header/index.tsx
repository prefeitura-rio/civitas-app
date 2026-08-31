'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'

export function MonitoredPlatesHeader() {
  const { formDialogDisclosure } = useMonitoredPlates()

  return (
    <div className="flex w-full justify-between">
      <h2>Placas Monitoradas</h2>
      <div className="flex gap-4">
        <Button asChild variant="link">
          <Link href={'/placas-monitoradas/historico'}>Histórico</Link>
        </Button>
        <Button onClick={formDialogDisclosure.onOpen}>Adicionar</Button>
      </div>
    </div>
  )
}
