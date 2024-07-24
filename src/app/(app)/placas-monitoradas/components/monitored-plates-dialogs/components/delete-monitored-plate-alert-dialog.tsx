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
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'
import { deleteMonitoredPlate } from '@/http/cars/monitored/delete-monitored-plate'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

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

  const { mutateAsync: deleteMonitoredPlateMutation } = useMutation({
    mutationFn: deleteMonitoredPlate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
      queryClient.invalidateQueries({
        queryKey: ['cars', 'monitored', onDeleteMonitoredPlateProps?.plate],
      })
    },
  })

  async function handleDeleteMonitoredPlate() {
    try {
      if (onDeleteMonitoredPlateProps) {
        const response = deleteMonitoredPlateMutation(
          onDeleteMonitoredPlateProps.plate,
        )
        toast.promise(response, {
          loading: `Excluindo operação ${onDeleteMonitoredPlateProps?.plate}...`,
          success: (data) => {
            return `Operação ${data.data.plate} excluída com sucesso!`
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
      setOnDeleteMonitoredPlateProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja excluir a placa{' '}
            <span className="font-semibold text-destructive">
              {onDeleteMonitoredPlateProps?.plate}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação removerá a placa{' '}
            <span className="font-semibold text-destructive">
              {onDeleteMonitoredPlateProps?.plate}
            </span>{' '}
            do monitoramento de placas. Você poderá adicioná-la novamente mais
            tarde, se desejar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMonitoredPlate}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
