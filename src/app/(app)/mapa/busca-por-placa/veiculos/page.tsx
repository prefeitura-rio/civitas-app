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
import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { useCortexRemainingCredits } from '@/hooks/use-queries/use-cortex-remaining-credits'
import { useVehiclesNecessaryCredits } from '@/hooks/use-queries/use-vehicles-necessary-credits'

import { TooManyPlates } from './components/too-many-plates-alert'
import { VehicleList } from './components/vehicle-list'

export default function Veiculos() {
  const {
    layers: {
      trips: { isLoading, getPossiblePlates, possiblePlates },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()
  const router = useRouter()

  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesNecessaryCredits(
    possiblePlates || [],
  )

  useEffect(() => {
    if (formattedSearchParams && !isLoading) {
      getPossiblePlates({
        plate: formattedSearchParams.plate,
        startTime: formattedSearchParams.from,
        endTime: formattedSearchParams.to,
      })
    }
  }, [])

  if (
    (possiblePlates && possiblePlates.length > 100) ||
    (remainingCredits &&
      creditsRequired &&
      remainingCredits.remaining_credit < creditsRequired.credits)
  ) {
    return <TooManyPlates />
  }

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
              <AlertDialogAction
                onClick={() => router.push('/mapa/busca-por-placa')}
              >
                Voltar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="w-full space-y-2">
      <Card className="w-full p-6">
        {isLoading ? (
          <div className="flex w-full items-center justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <VehicleList />
        )}
      </Card>
    </div>
  )
}
