'use client'

import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'
import { useProfile } from '@/hooks/use-queries/use-profile'
import { notAllowed } from '@/utils/template-messages'

export function MonitoredPlatesHeader() {
  const { formDialogDisclosure } = useMonitoredPlates()
  const { isAdmin } = useProfile()

  return (
    <div className="flex w-full justify-between">
      <h1 className="text-3xl font-semibold tracking-tight">
        Placas Monitoradas
      </h1>
      <Tooltip
        hideContent={isAdmin}
        disabled={!isAdmin}
        disabledText={notAllowed}
        asChild
      >
        <Button onClick={formDialogDisclosure.onOpen} disabled={!isAdmin}>
          Adicionar
        </Button>
      </Tooltip>
    </div>
  )
}
