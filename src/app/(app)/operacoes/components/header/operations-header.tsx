'use client'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useOperations } from '@/hooks/use-operations'
import { useProfile } from '@/hooks/use-profile'
import { notAllowed } from '@/utils/template-messages'

export function OperationsHeader() {
  const { formDialogDisclosure } = useOperations()
  const { isAdmin } = useProfile()

  return (
    <div className="flex w-full justify-between">
      <h1 className="text-3xl font-semibold tracking-tight">Operações</h1>
      <Tooltip
        disabledText={notAllowed}
        disabled={!isAdmin}
        hideContent={isAdmin}
      >
        <Button disabled={!isAdmin} onClick={formDialogDisclosure.onOpen}>
          Adicionar
        </Button>
      </Tooltip>
    </div>
  )
}