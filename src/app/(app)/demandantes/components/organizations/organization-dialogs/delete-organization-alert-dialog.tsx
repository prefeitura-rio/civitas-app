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
import { useOrganizations } from '@/hooks/useContexts/use-organizations-context'
import { deleteOrganization } from '@/http/organizations/delete-organization'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DeleteOrganizationAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DeleteOrganizationAlertDialog({
  isOpen,
  onClose,
  onOpen,
}: DeleteOrganizationAlertDialogProps) {
  const { onDeleteOrganizationProps, setOnDeleteOrganizationProps } =
    useOrganizations()

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['demandants'] })
    },
  })

  async function handleDelete() {
    try {
      if (!onDeleteOrganizationProps) return
      const response = deleteMutation(onDeleteOrganizationProps.id)
      toast.promise(response, {
        loading: `Excluindo organização ${onDeleteOrganizationProps.name}...`,
        success: (data) =>
          `Organização ${data.data.name} excluída com sucesso.`,
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
      setOnDeleteOrganizationProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir organização{' '}
            <span className="font-semibold text-destructive">
              {onDeleteOrganizationProps?.name}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação pode remover demandantes e vínculos relacionados no
            backend. Confirme antes de continuar.
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
