'use client'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useOperations } from '@/hooks/use-contexts/use-operations-context'
import { useProfile } from '@/hooks/use-queries/use-profile'
import { notAllowed } from '@/utils/template-messages'

export function OperationsHeader() {
  const { formDialogDisclosure } = useOperations()
  const { data: profile } = useProfile()

  return (
    <div className="flex w-full justify-between">
      <h2>Demandantes</h2>
      <Tooltip
        disabledText={notAllowed}
        disabled={!profile || !profile.is_admin}
        hideContent={!profile || profile.is_admin}
        asChild
      >
        <Button
          disabled={!profile || !profile.is_admin}
          onClick={formDialogDisclosure.onOpen}
        >
          Adicionar
        </Button>
      </Tooltip>
    </div>
  )
}
