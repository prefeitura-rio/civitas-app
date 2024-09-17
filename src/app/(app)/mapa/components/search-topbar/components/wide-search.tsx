'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { RectangleEllipsis, SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'

import { DatePickerWithRange } from '@/components/custom/date-range-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { toQueryParams } from '@/utils/to-query-params'

import { WideSearchFormData, wideSearchSchema } from './validationSchemas'

export function WideSearch() {
  const router = useRouter()
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
    const path = data.plate?.includes('*') ? 'veiculos' : 'veiculo'
    const query = toQueryParams(data)
    router.push(`/mapa/busca/${path}?${query}`)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-end space-x-4"
    >
      <div className="flex flex-col">
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePickerWithRange
              placeholder="Selecione uma data"
              onChange={field.onChange}
              fromDate={new Date(2024, 5, 1)}
              toDate={new Date()}
              value={field.value}
              defaultValue={field.value}
              defaultMonth={new Date().getMonth() - 1}
            />
          )}
        />
        {errors.date && (
          <span className="text-xs text-red-500">{errors.date.message}</span>
        )}
      </div>

      <div className="flex flex-col">
        <div className="relative">
          <RectangleEllipsis className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Controller
            name="plate"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                placeholder="Placa do Veículo"
                className="w-44 pl-10 dark:bg-gray-700 dark:text-white"
              />
            )}
          />
        </div>
        {errors.plate && (
          <span className="text-xs text-red-500">{errors.plate.message}</span>
        )}
      </div>

      <Button type="submit" className="dark:bg-blue-600">
        <SearchIcon className="mr-2 h-4 w-4" />
        Buscar
      </Button>
    </form>
  )
}
