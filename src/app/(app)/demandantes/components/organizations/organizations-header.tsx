'use client'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useOrganizations } from '@/hooks/useContexts/use-organizations-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { notAllowed } from '@/utils/template-messages'

export function OrganizationsHeader() {
  const { formDialogDisclosure, setDialogInitialData } = useOrganizations()
  const { data: profile } = useProfile()

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <h3 className="text-lg font-semibold">Organizações</h3>
      <Tooltip
        disabledText={notAllowed}
        disabled={!profile?.is_admin}
        hideContent={!profile || profile.is_admin}
        asChild
      >
        <Button
          disabled={!profile?.is_admin}
          onClick={() => {
            setDialogInitialData(null)
            formDialogDisclosure.onOpen()
          }}
          size="sm"
        >
          Adicionar organização
        </Button>
      </Tooltip>
    </div>
  )
}
