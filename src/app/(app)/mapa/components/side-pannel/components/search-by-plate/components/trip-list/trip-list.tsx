import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import React from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Separator } from '@/components/ui/separator'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { usePlate } from '@/hooks/use-queries/use-plate'

import { TripCard } from './components/trip-card'

export function TripList() {
  const {
    layers: {
      trips: { trips, lastSearchParams, isLoading },
    },
  } = useMap()

  const { data } = usePlate(lastSearchParams?.plate || '')

  const plateInfos = {
    'Marca/Modelo': data?.marcaModelo,
    Cor: data?.cor,
    Possuidor: data?.possuidor.nomePossuidor,
    Proprietario: data?.proprietario.nomeProprietario,
    'Ano do Modelo': data?.anoModelo,
  }

  if (!lastSearchParams) return null

  return (
    <div className="h-[calc(100%-15rem)] w-full">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : (
        trips && (
          <div className="h-[calc(100%-4.75rem)] space-y-2">
            <div className="text-center">
              <h4 className="">
                Resultado para{' '}
                <span className="code-highlight">{lastSearchParams.plate}</span>
              </h4>
              <span className="text-sm text-muted-foreground">
                {`${format(lastSearchParams.startTime, 'dd MMM, y HH:mm', { locale: ptBR })} - ${format(lastSearchParams.endTime, 'dd MMM, y HH:mm', { locale: ptBR })}`}
              </span>
            </div>

            <div className="h-[calc(100%)] overflow-y-scroll">
              {data && (
                <>
                  <h4 className="my-4 mb-2">Informações do Veículo:</h4>
                  <div className="mb-3 flex flex-col gap-0.5 text-sm">
                    {Object.entries(plateInfos).map(([key, value]) => (
                      <div>
                        <span className="text-sm font-medium">{key}: </span>
                        <span className="text-sm text-muted-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* <Separator className="my-3 bg-muted" /> */}
                </>
              )}

              {trips.length === 0 ? (
                <div className="flex h-full w-full justify-center pt-6">
                  <span className="text-muted-foreground">
                    Nenhum resultado encontrado.
                  </span>
                </div>
              ) : (
                <ul className="relative flex h-full w-full flex-col bg-card">
                  {trips.map((trip, index) => {
                    const startLocation = trip.points[0]
                    const endLocation = trip.points[trip.points.length - 1]
                    const cloneAlert = trip.cloneAlert

                    return (
                      <li key={index}>
                        <TripCard
                          index={index}
                          startLocation={startLocation}
                          endLocation={endLocation}
                          cloneAlert={cloneAlert}
                        />
                        <Separator className="bg-muted" />
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )
      )}
    </div>
  )
}
