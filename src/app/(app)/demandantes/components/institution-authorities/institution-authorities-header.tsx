'use client'
import { Button } from '@/components/ui/button'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'

export function InstitutionAuthoritiesHeader() {
  const { formDialogDisclosure, setDialogInitialData } =
    useInstitutionAuthorities()

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="min-w-0 flex-1 text-2xl font-semibold">Requisitantes</h2>
      <Button
        size="sm"
        className="min-w-[11.5rem] shrink-0"
        onClick={() => {
          setDialogInitialData(null)
          formDialogDisclosure.onOpen()
        }}
      >
        Adicionar requisitante
      </Button>
    </div>
  )
}
