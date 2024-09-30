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

export function InvalidParamsAlert() {
  const router = useRouter()
  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Parâmetros Inválidos</AlertDialogTitle>
          <AlertDialogDescription>
            Os parâmetros de busca são inválidos. Volte para o mapa e tente
            realizar a busca novamente pelo painel de busca.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/veiculos')}>
              Voltar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
