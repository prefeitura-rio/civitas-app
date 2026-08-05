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
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="min-w-0 flex-1 text-2xl font-semibold">Demandantes</h2>
      <Tooltip
        disabledText={notAllowed}
        disabled={!profile?.is_admin}
        hideContent={!profile || profile.is_admin}
        asChild
      >
        <Button
          size="sm"
          className="min-w-[11.5rem] shrink-0"
          disabled
          onClick={() => {
            setDialogInitialData(null)
            formDialogDisclosure.onOpen()
          }}
        >
          Adicionar demandante
        </Button>
      </Tooltip>
    </div>
  )
}
