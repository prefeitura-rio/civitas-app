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
    <div className="flex w-full items-center justify-between gap-2">
      <h3 className="text-lg font-semibold">Autoridades</h3>
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
          Adicionar autoridade
        </Button>
      </Tooltip>
    </div>
  )
}
