'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, RectangleEllipsis, SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { DatePickerWithRange } from '@/components/custom/date-range-picker'
import { PlateWildcardsHelperInfo } from '@/components/custom/plate-wildcards-helper-info'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

export function WideSearchForm() {
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
            from: new Date(),
            to: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          },
          plate: '',
        },
  })

  const onSubmit = (data: WideSearchFormData) => {
    console.log('Realizando busca na cidade:', data)
    const query = toQueryParams(data)

    if (data.plate.includes('*')) {
      getPossiblePlates({
        plate: data.plate,
        startTime: data.date.from.toISOString(),
        endTime: data.date.to.toISOString(),
      })

      router.push(`/mapa/busca-ampla/veiculos?${query.toString()}`)
    } else {
      getTrips({
        plate: data.plate,
        startTime: data.date.from.toISOString(),
        endTime: data.date.to.toISOString(),
      })

      router.push(`/mapa/busca-ampla/veiculo?${query.toString()}`)
    }
  }

  return (
    <Card className="w-full max-w-screen-md">
      <CardHeader>
        <CardTitle>Formulário de Busca Ampla</CardTitle>
        <CardDescription>
          {/* Realize uma busca detalhada das detecções de um veículo em toda a */}
          {/* cidade, especificando a placa e o intervalo de datas desejado. */}
          Consulte informações de um veículo e lugares onde ele foi detectado na
          cidade do Rio de Janeiro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid w-full grid-cols-2 gap-x-8 gap-y-2"
        >
          <div className="flex w-full items-center gap-2 overflow-hidden rounded-md border-r border-secondary">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePickerWithRange
                  placeholder="Selecione uma data"
                  className="w-full"
                  onChange={field.onChange}
                  fromDate={new Date(2024, 5, 1)}
                  toDate={new Date()}
                  value={field.value}
                  defaultValue={field.value}
                  defaultMonth={new Date().getMonth() - 1}
                />
              )}
            />
            {errors.date && (errors.date.to || errors.date?.from) && (
              <span className="text-xs text-red-500">
                {errors.date.message ||
                  errors.date.from?.message ||
                  errors.date.to?.message}
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
                    className="w-full pl-10 dark:bg-gray-700 dark:text-white"
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
      </CardContent>
    </Card>
  )
}
