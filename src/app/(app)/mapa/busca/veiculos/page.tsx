'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Spinner } from '@/components/custom/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'

import { ActionButtons } from '../components/action-buttons'
import { PlateList } from './components/plates'

export default function Veiculos() {
  const {
    layers: {
      trips: { isLoading, getPossiblePlates },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (formattedSearchParams && !isLoading) {
      getPossiblePlates({
        plate: formattedSearchParams.plate,
        startTime: formattedSearchParams.from,
        endTime: formattedSearchParams.to,
      })
    }
  }, [])

  if (!formattedSearchParams) {
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
              <AlertDialogAction onClick={() => router.push('/mapa')}>
                Voltar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="h-full space-y-2">
      <ActionButtons />
      {isLoading ? (
        <div className="flex h-[calc(100%-7rem)] w-full items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : (
        <PlateList />
      )}
    </div>
  )
}
