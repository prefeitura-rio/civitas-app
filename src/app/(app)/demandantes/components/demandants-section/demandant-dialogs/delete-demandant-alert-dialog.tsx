import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDemandantsContext } from '@/hooks/useContexts/use-demandants-context'
import { deleteDemandant } from '@/http/demandants/delete-demandant'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DeleteDemandantAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DeleteDemandantAlertDialog({
  isOpen,
  onClose,
  onOpen,
}: DeleteDemandantAlertDialogProps) {
  const { onDeleteDemandantProps, setOnDeleteDemandantProps } =
    useDemandantsContext()

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: deleteDemandant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandants'] })
    },
  })

  async function handleDelete() {
    try {
      if (!onDeleteDemandantProps) return
      const response = deleteMutation(onDeleteDemandantProps.id)
      toast.promise(response, {
        loading: `Excluindo demandante ${onDeleteDemandantProps.name}...`,
        success: (data) => `Demandante ${data.data.name} excluído com sucesso.`,
        error: genericErrorMessage,
      })
      await response
    } catch {
      toast.error(genericErrorMessage)
    }
  }

  function handleOnOpenChange(open: boolean) {
    if (open) onOpen()
    else {
      onClose()
      setOnDeleteDemandantProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir demandante{' '}
            <span className="font-semibold text-destructive">
              {onDeleteDemandantProps?.name}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vínculos com placas monitoradas podem ser removidos em cascata no
            backend.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
