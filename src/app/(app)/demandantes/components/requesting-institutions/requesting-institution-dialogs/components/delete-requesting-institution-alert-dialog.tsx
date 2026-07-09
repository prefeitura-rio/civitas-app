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
import { useRequestingInstitutions } from '@/hooks/useContexts/use-requesting-institutions-context'
import { deleteRequestingInstitution } from '@/http/requesting-institutions'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DeleteRequestingInstitutionAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DeleteRequestingInstitutionAlertDialog({
  isOpen,
  onClose,
  onOpen,
}: DeleteRequestingInstitutionAlertDialogProps) {
  const {
    onDeleteRequestingInstitutionProps,
    setOnDeleteRequestingInstitutionProps,
  } = useRequestingInstitutions()

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: deleteRequestingInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requesting-institutions'] })
    },
  })

  async function handleDelete() {
    try {
      if (onDeleteRequestingInstitutionProps) {
        const response = deleteMutation(onDeleteRequestingInstitutionProps.id)
        toast.promise(response, {
          loading: `Excluindo requisitante ${onDeleteRequestingInstitutionProps.name}...`,
          success: () =>
            `Requisitante ${onDeleteRequestingInstitutionProps.name} excluído com sucesso!`,
          error: genericErrorMessage,
        })
        await response
      }
    } catch {
      toast.error(genericErrorMessage)
    }
  }

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      onClose()
      setOnDeleteRequestingInstitutionProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja excluir o requisitante{' '}
            <span className="font-semibold text-destructive">
              {onDeleteRequestingInstitutionProps?.name}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação apagará definitivamente o requisitante{' '}
            <span className="font-semibold text-destructive">
              {onDeleteRequestingInstitutionProps?.name}
            </span>{' '}
            e não poderá ser desfeita.
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
