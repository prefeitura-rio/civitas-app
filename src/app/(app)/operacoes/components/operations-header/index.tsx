'use client'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useOperations } from '@/hooks/use-contexts/use-operations-context'
import { useProfile } from '@/hooks/use-queries/use-profile'
import { notAllowed } from '@/utils/template-messages'

export function OperationsHeader() {
  const { formDialogDisclosure } = useOperations()
  const { isAdmin } = useProfile()

  return (
    <div className="flex w-full justify-between">
      <h2>Operações</h2>
      <Tooltip
        disabledText={notAllowed}
        disabled={!isAdmin}
        hideContent={isAdmin}
        asChild
      >
        <Button disabled={!isAdmin} onClick={formDialogDisclosure.onOpen}>
          Adicionar
        </Button>
      </Tooltip>
    </div>
  )
}
