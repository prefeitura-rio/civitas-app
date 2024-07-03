import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteMonitoredPlate } from '@/http/cars/monitored/delete-monitored-plate'
import { getMonitoredPlates } from '@/http/cars/monitored/get-monitored-plates'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DeleteMonitoredPlateAlertDialogProps {
  plate: string
}

export function DeleteMonitoredPlateAlertDialog({
  plate,
}: DeleteMonitoredPlateAlertDialogProps) {
  const { mutateAsync: deleteMonitoredPlateMutation } = useMutation({
    mutationFn: deleteMonitoredPlate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars/monitored'] })
    },
  })

  async function handleDeleteMonitoredPlate() {
    try {
      const response = deleteMonitoredPlateMutation(plate)
      toast.promise(response, {
        loading: `Removendo placa ${plate}...`,
        success: (data) => {
          return `Placa ${data.data.plate} removida com sucesso!`
        },
        error: genericErrorMessage,
      })
      await response
      getMonitoredPlates({})
    } catch (error) {
      toast.error(genericErrorMessage)
    }
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Tem certeza que deseja excluir a placa{' '}
          <span className="font-semibold text-destructive">{plate}</span>?
        </AlertDialogTitle>
        <AlertDialogDescription>
          Essa ação removerá a placa{' '}
          <span className="font-semibold text-destructive">{plate}</span> do
          monitoramento de placas. Você poderá adicioná-la novamente mais tarde,
          se desejar.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={handleDeleteMonitoredPlate}>
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
