import { useMutation } from '@tanstack/react-query'
import type { MouseEvent } from 'react'
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
import { getApiErrorMessage } from '@/utils/error-handlers'

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

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteInstitutionAuthority,
  })

  async function handleDeleteSuccess(name: string, toastId: string | number) {
    await queryClient.invalidateQueries({
      queryKey: ['institution-authorities'],
    })
    toast.success(`Requisitante ${name} excluído com sucesso!`, {
      id: toastId,
    })
    onClose()
    setOnDeleteInstitutionAuthorityProps(null)
  }

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (!onDeleteInstitutionAuthorityProps) return

    const authority = onDeleteInstitutionAuthorityProps
    const toastId = toast.loading(`Excluindo requisitante ${authority.name}...`)

    try {
      await deleteMutation(authority.id)
      await handleDeleteSuccess(authority.name, toastId)
    } catch (error) {
      toast.error(getApiErrorMessage(error), { id: toastId })
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
            Tem certeza que deseja excluir o requisitante{' '}
            <span className="font-semibold text-destructive">
              {onDeleteInstitutionAuthorityProps?.name}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação apagará definitivamente a requisitante e seus contatos
            cadastrados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
