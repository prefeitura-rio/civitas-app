'use client'

import Link from 'next/link'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { notAllowed } from '@/utils/template-messages'

export function MonitoredPlatesHeader() {
  const { formDialogDisclosure, setDialogInitialData } = useMonitoredPlates()
  const { data: profile } = useProfile()

  return (
    <div className="flex w-full justify-between">
      <h2>Placas Monitoradas</h2>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        <Button asChild variant="link">
          <Link href="/placas-monitoradas/historico">Histórico</Link>
        </Button>
        <Tooltip
          hideContent={!profile || profile.is_admin}
          disabled={!profile || !profile.is_admin}
          disabledText={notAllowed}
          asChild
        >
          <Button
            onClick={() => {
              setDialogInitialData(null)
              formDialogDisclosure.onOpen()
            }}
            disabled={!profile || !profile.is_admin}
          >
            Adicionar placa
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
