'use client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/app/(app)/pessoas/components/get-error-message'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { useCortexRemainingCredits } from '@/hooks/use-queries/use-cortex-remaining-credits'
import { useVehicles } from '@/hooks/use-queries/use-vehicles'
import { useVehiclesCreditsRequired } from '@/hooks/use-queries/use-vehicles-credits-required'
import { useSearchByPlateEnhancedResultDynamicFilter } from '@/hooks/use-search-by-plate-enhanced-result-dynamic-filter'
import { cortexRequestLimit } from '@/utils/constants'

import { Filter } from './components/filter'
import { TooManyPlates } from './components/too-many-plates-alert'
import { VehicleList } from './components/vehicle-list'

export default function Veiculos() {
  const [isLoading, setIsLoading] = useState(true)

  const {
    layers: {
      trips: {
        isLoading: isPossiblePlatesLoading,
        getPossiblePlates,
        possiblePlates,
      },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()
  const router = useRouter()

  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesCreditsRequired(
    possiblePlates || [],
  )

  const {
    data: vehicles,
    isLoading: isVehiclesLoading,
    error,
  } = useVehicles(possiblePlates || [])

  const filters = useSearchByPlateEnhancedResultDynamicFilter({
    data: vehicles,
  })
  const { filteredData } = filters
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
    (possiblePlates && possiblePlates.length > cortexRequestLimit) ||
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
                onClick={() => router.push('/veiculos/busca-por-placa')}
              >
                Voltar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  useEffect(() => {
    if (!isVehiclesLoading && !isPossiblePlatesLoading) {
      setIsLoading(false)
    }
  }, [isVehiclesLoading, isPossiblePlatesLoading])

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="">
          Resultado para{' '}
          <span className="code-highlight">{formattedSearchParams.plate}</span>
        </CardTitle>
        <CardDescription className="">
          {`${format(formattedSearchParams.from, 'dd MMM, y HH:mm', { locale: ptBR })} - ${format(formattedSearchParams.to, 'dd MMM, y HH:mm', { locale: ptBR })}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex w-full justify-center p-6">
            <Spinner className="size-10" />
          </div>
        )}
        {vehicles && <Filter filters={filters} />}
        {filteredData && (
          <div className="flex w-full">
            <VehicleList data={filteredData} isLoading={isLoading} />
          </div>
        )}
        {error && (
          <div className="flex justify-center rounded-lg border-l-2 border-rose-500 bg-secondary px-3 py-2">
            <span className="pl-6 -indent-6 text-sm text-muted-foreground">
              {`⚠️ Não foi possível retornar informações a respeito desse veículo. ${getErrorMessage(error)}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
