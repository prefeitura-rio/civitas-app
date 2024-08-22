'use client'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'
import { useProfile } from '@/hooks/use-queries/use-profile'
import { notAllowed } from '@/utils/template-messages'

export function MonitoredPlatesHeader() {
  const { formDialogDisclosure } = useMonitoredPlates()
  const { isAdmin } = useProfile()

  return (
    <div className="flex w-full justify-between">
      <h2>Placas Monitoradas</h2>
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
