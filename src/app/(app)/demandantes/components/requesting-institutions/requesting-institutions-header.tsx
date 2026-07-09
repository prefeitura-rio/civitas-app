'use client'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useRequestingInstitutions } from '@/hooks/useContexts/use-requesting-institutions-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { notAllowed } from '@/utils/template-messages'

export function RequestingInstitutionsHeader() {
  const { formDialogDisclosure, setDialogInitialData } =
    useRequestingInstitutions()
  const { data: profile } = useProfile()

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <h3 className="text-lg font-semibold">Requisitantes</h3>
      <Tooltip
        disabledText={notAllowed}
        disabled={!profile?.is_admin}
        hideContent={!profile || profile.is_admin}
        asChild
      >
        <Button
          size="sm"
          disabled={!profile?.is_admin}
          onClick={() => {
            setDialogInitialData(null)
            formDialogDisclosure.onOpen()
          }}
        >
          Adicionar requisitante
        </Button>
      </Tooltip>
    </div>
  )
}
