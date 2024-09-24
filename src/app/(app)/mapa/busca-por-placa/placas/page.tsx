'use client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

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
import { useSearchByPlateResultDynamicFilter } from '@/hooks/use-search-by-plate-result-dynamic-filter'

import { ActionBar } from './components/action-bar'
import { Filter } from './components/filter'
import { PlateList } from './components/plate-list'

export default function Veiculos() {
  const {
    layers: {
      trips: { isLoading, getPossiblePlates, possiblePlates },
    },
  } = useMap()

  const { formattedSearchParams } = useCarPathsSearchParams()
  const router = useRouter()

  const data = useMemo(() => {
    return possiblePlates?.map((plate) => ({ plate })) || []
  }, [possiblePlates])

  const filters = useSearchByPlateResultDynamicFilter({
    data,
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
    <div className="flex w-full flex-col items-center gap-4">
      <ActionBar isLoading={isLoading} filters={filters} />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="">
            Resultado para{' '}
            <span className="code-highlight">
              {formattedSearchParams.plate}
            </span>
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
          {data && <Filter filters={filters} />}
          {filteredData && (
            <div className="flex w-full">
              <PlateList data={filteredData} isLoading={isLoading} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
