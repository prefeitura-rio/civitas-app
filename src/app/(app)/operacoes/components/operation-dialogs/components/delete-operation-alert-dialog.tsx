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
import { useOperations } from '@/hooks/use-contexts/use-operations-context'
import { deleteOperation } from '@/http/operations/delete-operation'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DeleteOperationAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DeleteOperationAlertDialog({
  isOpen,
  onClose,
  onOpen,
}: DeleteOperationAlertDialogProps) {
  const { onDeleteOperationProps, setOnDeleteOperationProps } = useOperations()

  const { mutateAsync: deleteOperationMutation } = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] })
    },
  })

  async function handleDeleteOperation() {
    try {
      if (onDeleteOperationProps) {
        const response = deleteOperationMutation(onDeleteOperationProps.id)
        toast.promise(response, {
          loading: `Excluindo operação ${onDeleteOperationProps?.title}...`,
          success: (data) => {
            return `Operação ${data.data.title} excluída com sucesso!`
          },
          error: genericErrorMessage,
        })
        await response
      }
    } catch (error) {
      toast.error(genericErrorMessage)
    }
  }

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      onClose()
      setOnDeleteOperationProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja excluir a operação{' '}
            <span className="font-semibold text-destructive">
              {onDeleteOperationProps?.title}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação apagará definitivamente a operação{' '}
            <span className="font-semibold text-destructive">
              {onDeleteOperationProps?.title}
            </span>{' '}
            e não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteOperation}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
