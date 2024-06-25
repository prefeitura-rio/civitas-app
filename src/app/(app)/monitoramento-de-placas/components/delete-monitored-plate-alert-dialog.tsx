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
import { deleteMonitoredPlate } from '@/http/cars/delete-monitored-plate'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DeleteMonitoredPlateAlertDialogProps {
  id: string
  plate: string
}

export function DeleteMonitoredPlateAlertDialog({
  id,
  plate,
}: DeleteMonitoredPlateAlertDialogProps) {
  async function handleDeleteMonitoredPlate() {
    try {
      const response = deleteMonitoredPlate(id)
      toast.promise(response, {
        loading: `Removendo placa ${plate}...`,
        success: (data) => {
          return `Placa ${data.data.plate} removida com sucesso!`
        },
        error: genericErrorMessage,
      })
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
