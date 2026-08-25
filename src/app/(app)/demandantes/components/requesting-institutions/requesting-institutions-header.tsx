'use client'
import { Button } from '@/components/ui/button'
import { useRequestingInstitutions } from '@/hooks/useContexts/use-requesting-institutions-context'

export function RequestingInstitutionsHeader() {
  const { formDialogDisclosure, setDialogInitialData } =
    useRequestingInstitutions()

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="min-w-0 flex-1 text-2xl font-semibold">Demandantes</h2>
      <Button
        size="sm"
        className="min-w-[11.5rem] shrink-0"
        onClick={() => {
          setDialogInitialData(null)
          formDialogDisclosure.onOpen()
        }}
      >
        Adicionar demandante
      </Button>
    </div>
  )
}
