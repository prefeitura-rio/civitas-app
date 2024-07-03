'use client'
import { Button } from '@/components/ui/button'
import { useOperations } from '@/hooks/use-operations'

export function OperationsHeader() {
  const { createDialogDisclosure } = useOperations()
  return (
    <div className="flex w-full justify-between">
      <h1 className="text-3xl font-semibold tracking-tight">Operações</h1>
      <Button onClick={createDialogDisclosure.onOpen}>Adicionar</Button>
    </div>
  )
}
