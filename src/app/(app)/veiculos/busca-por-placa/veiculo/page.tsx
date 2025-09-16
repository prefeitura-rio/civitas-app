'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCarPathsSearchParams } from '@/hooks/useParams/useCarPathsSearchParams'
import { useMapLayers } from '@/stores/use-map-store'

import { ActionBar } from './components/action-bar'
import { TripList } from './components/trip-list'

export default function Veiculo() {
  const {
    trips: { isLoading, getTrips },
  } = useMapLayers()
  const { formattedSearchParams } = useCarPathsSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (formattedSearchParams && !isLoading) {
      getTrips({
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
              <AlertDialogAction onClick={() => router.push('/veiculos')}>
                Voltar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ActionBar />
      <TripList />
    </div>
  )
}
