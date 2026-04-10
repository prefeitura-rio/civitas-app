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
import { deleteMonitoredPlate } from '@/http/cars/monitored/delete-monitored-plate'
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
  const { mutateAsync: deleteMonitoredPlateMutation, isPending } = useMutation({
    mutationFn: () => deleteMonitoredPlate(plate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored', plate] })
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
    },
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remover placa do monitoramento?{' '}
            <span className="font-semibold text-destructive">{plate}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            O cadastro desta placa como monitorada será excluído (incluindo
            vínculos e configurações associadas). Você poderá cadastrá-la
            novamente depois, se precisar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault()
              deleteMonitoredPlateMutation()
                .then(() => {
                  onOpenChange(false)
                })
                .catch(() => {
                  /* erro da API */
                })
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
