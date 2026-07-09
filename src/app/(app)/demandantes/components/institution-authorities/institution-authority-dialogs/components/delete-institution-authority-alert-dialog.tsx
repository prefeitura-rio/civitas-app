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
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import { deleteInstitutionAuthority } from '@/http/institution-authorities'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DeleteInstitutionAuthorityAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DeleteInstitutionAuthorityAlertDialog({
  isOpen,
  onClose,
  onOpen,
}: DeleteInstitutionAuthorityAlertDialogProps) {
  const {
    onDeleteInstitutionAuthorityProps,
    setOnDeleteInstitutionAuthorityProps,
  } = useInstitutionAuthorities()

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: deleteInstitutionAuthority,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-authorities'] })
    },
  })

  async function handleDelete() {
    try {
      if (!onDeleteInstitutionAuthorityProps) return

      const response = deleteMutation(onDeleteInstitutionAuthorityProps.id)
      toast.promise(response, {
        loading: `Excluindo autoridade ${onDeleteInstitutionAuthorityProps.name}...`,
        success: () =>
          `Autoridade ${onDeleteInstitutionAuthorityProps.name} excluída com sucesso!`,
        error: genericErrorMessage,
      })
      await response
    } catch {
      toast.error(genericErrorMessage)
    }
  }

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      onClose()
      setOnDeleteInstitutionAuthorityProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja excluir a autoridade{' '}
            <span className="font-semibold text-destructive">
              {onDeleteInstitutionAuthorityProps?.name}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação apagará definitivamente a autoridade e seus contatos
            cadastrados.
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
