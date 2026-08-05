'use client'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { notAllowed } from '@/utils/template-messages'

export function InstitutionAuthoritiesHeader() {
  const { formDialogDisclosure, setDialogInitialData } =
    useInstitutionAuthorities()
  const { data: profile } = useProfile()

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="min-w-0 flex-1 text-2xl font-semibold">Requisitantes</h2>
      <Tooltip
        disabledText={notAllowed}
        disabled={!profile?.is_admin}
        hideContent={!profile || profile.is_admin}
        asChild
      >
        <Button
          size="sm"
          className="min-w-[11.5rem] shrink-0"
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
