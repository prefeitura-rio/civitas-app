import { useMutation } from '@tanstack/react-query'

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
import { updateMonitoredPlate } from '@/http/cars/monitored/update-monitored-plate'
import { queryClient } from '@/lib/react-query'

interface DisableMonitoringAlertDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  plate: string
}

export function DisableMonitoringAlertDialog({
  isOpen,
  onOpenChange,
  plate,
}: DisableMonitoringAlertDialogProps) {
  const { mutateAsync: updateMonitoredPlateMutation } = useMutation({
    mutationFn: () => updateMonitoredPlate({ plate, active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`cars/monitored/${plate}`] })
    },
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Desativar monitoramento da placa{' '}
            <span className="font-semibold text-destructive">{plate}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja desativar o monitoramento da placa{' '}
            <span className="font-semibold text-destructive">{plate}</span>?
            Você não receberá mais notificações caso essa placa seja avistada
            por uma das câmeras da cidade.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => updateMonitoredPlateMutation()}>
            Desativar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
