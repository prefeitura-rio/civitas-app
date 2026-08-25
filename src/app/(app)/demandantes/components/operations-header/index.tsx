'use client'
import { Button } from '@/components/ui/button'
import { useOperations } from '@/hooks/useContexts/use-operations-context'

export function OperationsHeader() {
  const { formDialogDisclosure } = useOperations()

  return (
    <div className="flex w-full justify-between">
      <h2>Demandantes</h2>
      <Button onClick={formDialogDisclosure.onOpen}>Adicionar</Button>
    </div>
  )
}
