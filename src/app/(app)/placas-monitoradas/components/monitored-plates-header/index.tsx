'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'

export function MonitoredPlatesHeader() {
  const { formDialogDisclosure } = useMonitoredPlates()

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl sm:text-3xl">Placas Monitoradas</h2>
      <div className="flex w-full gap-2 sm:w-auto sm:gap-4">
        <Button asChild variant="link" className="flex-1 sm:flex-none">
          <Link href={'/placas-monitoradas/historico'}>Histórico</Link>
        </Button>
        <Button
          onClick={formDialogDisclosure.onOpen}
          className="flex-1 sm:flex-none"
        >
          Adicionar
        </Button>
      </div>
    </div>
  )
}
