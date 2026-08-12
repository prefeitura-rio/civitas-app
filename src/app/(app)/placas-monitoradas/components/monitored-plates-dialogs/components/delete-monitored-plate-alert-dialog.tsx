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
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { deactivateMonitoredPlateAuthorityLinks } from '@/http/monitored-plates'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

interface DeleteMonitoredPlateAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DeleteMonitoredPlateAlertDialog({
  isOpen,
  onClose,
  onOpen,
}: DeleteMonitoredPlateAlertDialogProps) {
  const { onDeleteMonitoredPlateProps, setOnDeleteMonitoredPlateProps } =
    useMonitoredPlates()

  function closeDialog() {
    onClose()
    setOnDeleteMonitoredPlateProps(null)
  }

  const { mutateAsync: deactivateAuthorityLinksMutation, isPending } =
    useMutation({
      mutationFn: deactivateMonitoredPlateAuthorityLinks,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['monitored-plates'] })
        queryClient.invalidateQueries({
          queryKey: ['monitored-plates', onDeleteMonitoredPlateProps?.plate],
        })
        queryClient.invalidateQueries({
          queryKey: ['monitored-plate-authorities'],
        })
        closeDialog()
      },
    })

  async function handleDeactivateMonitoredPlateLinks(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()

    if (!onDeleteMonitoredPlateProps || isPending) return

    const plate = onDeleteMonitoredPlateProps.plate
    const toastId = toast.loading(`Desativando vínculos da placa ${plate}...`)

    try {
      const data = await deactivateAuthorityLinksMutation(plate)
      toast.success(
        `Vínculos de requisitante da placa ${data.plate} desativados com sucesso!`,
        { id: toastId },
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error), { id: toastId })
    }
  }

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      closeDialog()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja desativar os vínculos da placa{' '}
            <span className="font-semibold text-destructive">
              {onDeleteMonitoredPlateProps?.plate}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação desativa todos os vínculos de requisitante da placa.
            <br />A placa permanece cadastrada, mas não será mais monitorada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleDeactivateMonitoredPlateLinks}
          >
            Desativar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
