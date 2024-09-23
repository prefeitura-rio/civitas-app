import { useRouter } from 'next/navigation'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function TooManyPlates() {
  const router = useRouter()
  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Não é possível realizar essa busca
          </AlertDialogTitle>
          <AlertDialogDescription>
            Apenas 100 placas podem ser enriquecidas por hora. Tente novamente
            mais tarde ou altere os parâmetros da busca para ter um resultado
            menor que satisfaça o limite imposto.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => router.push('/mapa/busca-por-radar')}
            >
              Voltar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
