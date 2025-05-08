'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, RectangleEllipsis, SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { PlateWildcardsHelperInfo } from '@/components/custom/plate-wildcards-helper-info'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { toQueryParams } from '@/utils/to-query-params'
import { dateRangeSchema, requiredPlateHintSchema } from '@/utils/zod-schemas'

export const wideSearchSchema = z.object({
  date: dateRangeSchema,
  plate: requiredPlateHintSchema,
})

export type WideSearchFormData = z.infer<typeof wideSearchSchema>

export function SearchByPlateForm() {
  const router = useRouter()
  const {
    layers: {
      trips: { getTrips, getPossiblePlates },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WideSearchFormData>({
    resolver: zodResolver(wideSearchSchema),
    defaultValues: formattedSearchParams
      ? {
          date: {
            from: new Date(formattedSearchParams.from),
            to: new Date(formattedSearchParams.to),
          },
          plate: formattedSearchParams.plate,
        }
      : {
          date: {
            from: new Date(
              new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).setSeconds(0, 0),
            ), // 7 days ago
            to: new Date(new Date().setSeconds(0, 0)),
          },
          plate: '',
        },
  })

  const dateValues = watch('date')

  const onSubmit = (data: WideSearchFormData) => {
    const query = toQueryParams(data)

    if (data.plate.includes('*')) {
      getPossiblePlates({
        plate: data.plate,
        startTime: data.date.from.toISOString(),
        endTime: data.date.to.toISOString(),
      })

      router.push(`/veiculos/busca-por-placa/placas?${query.toString()}`)
    } else {
      getTrips({
        plate: data.plate,
        startTime: data.date.from.toISOString(),
        endTime: data.date.to.toISOString(),
      })

      router.push(`/veiculos/busca-por-placa/veiculo?${query.toString()}`)
    }
  }

  return (
    <>
      <Card className="mb-2 w-full max-w-screen-md p-4">
        <h1 className="text-lg font-bold">Busca por Placa</h1>
      </Card>

      <Card className="w-full max-w-screen-md p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid w-full grid-cols-2 gap-x-8 gap-y-2"
        >
          <div className="flex w-full flex-col gap-2 overflow-hidden">
            <div className="flex items-center gap-2">
              <Controller
                name="date.from"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    type="datetime-local"
                    value={field.value}
                    onChange={(newDate) => {
                      if (newDate) {
                        field.onChange(newDate)
                      }
                    }}
                    fromDate={new Date(2024, 5, 1)}
                    toDate={dateValues?.to || new Date()}
                    className="w-full"
                  />
                )}
              />
            </div>
            {errors.date?.from && (
              <span className="text-xs text-red-500">
                {errors.date.from.message}
              </span>
            )}
          </div>

          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              <Controller
                name="date.to"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    type="datetime-local"
                    value={field.value}
                    onChange={(newDate) => {
                      if (newDate) {
                        field.onChange(newDate)
                      }
                    }}
                    fromDate={dateValues?.from || new Date(2024, 5, 1)}
                    toDate={new Date()}
                    className="w-full"
                  />
                )}
              />
            </div>
            {errors.date?.to && (
              <span className="text-xs text-red-500">
                {errors.date.to.message}
              </span>
            )}
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="relative w-full">
              <RectangleEllipsis className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Controller
                name="plate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    placeholder="Placa do Veículo"
                    className="w-full pl-10 pr-8 dark:bg-gray-700 dark:text-white"
                  />
                )}
              />
              <div className="absolute-y-centered right-2 flex items-center">
                <Tooltip render={<PlateWildcardsHelperInfo />}>
                  <Info className="size-4 text-muted-foreground" />
                </Tooltip>
              </div>
            </div>
            {errors.plate && (
              <span className="text-xs text-red-500">
                {errors.plate.message}
              </span>
            )}
          </div>

          <div className="col-span-2 flex justify-end">
            <Button type="submit" className="mt-4">
              <SearchIcon className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
