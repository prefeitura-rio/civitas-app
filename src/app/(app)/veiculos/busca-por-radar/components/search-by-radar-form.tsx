'use client'
import '@/utils/date-extensions'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  type RadarSearchFormData,
  radarSearchSchema,
} from '@/app/(app)/veiculos/components/validationSchemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { toQueryParams } from '@/utils/to-query-params'

interface TimeValidation {
  isValid: boolean
  message: string
  duration: number
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000
const MIN_DATE = new Date(2024, 5, 1)
const MAX_DATE = new Date()

export function SearchByRadarForm() {
  const router = useRouter()
  const { formattedSearchParams } = useCarRadarSearchParams()

  const [timeValidation, setTimeValidation] = useState<TimeValidation>({
    isValid: true,
    message: '',
    duration: 0,
  })

  const defaultValues = useMemo(
    () => ({
      startDate: formattedSearchParams?.date.from
        ? new Date(formattedSearchParams.date.from)
        : new Date(new Date().setSeconds(0, 0)),
      endDate: formattedSearchParams?.date.to
        ? new Date(formattedSearchParams.date.to)
        : new Date(new Date().setSeconds(0, 0) + FIVE_HOURS_MS),
      plate: formattedSearchParams?.plate || '',
      radarIds: formattedSearchParams?.radarIds || [],
    }),
    [formattedSearchParams],
  )

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<RadarSearchFormData>({
    resolver: zodResolver(radarSearchSchema),
    defaultValues,
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Ajustar automaticamente endDate quando startDate mudar
  useEffect(() => {
    if (startDate) {
      const newEndDate = new Date(startDate.getTime() + FIVE_HOURS_MS)
      setValue('endDate', newEndDate)
    }
  }, [startDate, setValue])

  // Validar tempo em tempo real
  useEffect(() => {
    if (!startDate || !endDate) return

    const timeDiff = endDate.getTime() - startDate.getTime()
    const isValid = timeDiff > 0 && timeDiff <= FIVE_HOURS_MS

    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    const message = isValid
      ? `${hours}h ${minutes}min`
      : timeDiff <= 0
        ? 'A data/hora de fim deve ser posterior à data/hora de início'
        : `Máximo de 5 horas permitido (atual: ${hours}h ${minutes}min)`

    setTimeValidation({ isValid, message, duration: timeDiff })
  }, [startDate, endDate])

  const handleFormSubmit = useCallback(
    (data: RadarSearchFormData) => {
      const queryData = {
        startDate: data.startDate,
        endDate: data.endDate,
        plate: data.plate,
        radarIds: data.radarIds,
      }

      const query = toQueryParams(queryData)
      const url = `/veiculos/busca-por-radar/resultado?${query.toString()}`
      router.push(url)
    },
    [router],
  )

  const handleRadarIdsChange = useCallback(
    (value: string, onChange: (value: string[]) => void) => {
      const codes = value
        .split(',')
        .map((code) => code.trim())
        .filter(Boolean)
      onChange(codes)
    },
    [],
  )

  const renderDateField = useCallback(
    (name: 'startDate' | 'endDate', label: string, showValidation = false) => (
      <div className="flex w-full flex-col">
        <label className="mb-2 text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <DatePicker
              className="w-full"
              value={field.value}
              onChange={field.onChange}
              type="datetime-local"
              disabled={isSubmitting}
              fromDate={MIN_DATE}
              toDate={MAX_DATE}
            />
          )}
        />
        {errors[name] && (
          <span className="mt-1 text-sm text-red-500">
            {errors[name]?.message}
          </span>
        )}
        {showValidation && timeValidation && (
          <div
            className={`mt-1 text-sm ${
              timeValidation.isValid ? 'text-blue-600' : 'text-red-500'
            }`}
          >
            {timeValidation.message}
          </div>
        )}
      </div>
    ),
    [control, isSubmitting, errors, timeValidation],
  )

  const renderInputField = useCallback(
    (
      name: 'plate' | 'radarIds',
      label: string,
      placeholder: string,
      isRadarIds = false,
    ) => {
      const getInputValue = (fieldValue: string | string[] | undefined) => {
        if (!isRadarIds) return fieldValue
        return Array.isArray(fieldValue) ? fieldValue.join(', ') : ''
      }

      const handleInputChange = (
        value: string,
        onChange: (value: string | string[]) => void,
      ) => {
        if (isRadarIds) {
          handleRadarIdsChange(value, onChange as (value: string[]) => void)
        } else {
          onChange(value)
        }
      }

      return (
        <div className="flex w-full flex-col">
          <label className="mb-2 text-sm font-medium text-muted-foreground">
            {label}
          </label>
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Input
                {...field}
                className="w-full"
                placeholder={placeholder}
                disabled={isSubmitting}
                value={getInputValue(field.value)}
                onChange={(e) =>
                  handleInputChange(e.target.value, field.onChange)
                }
              />
            )}
          />
          {errors[name] && (
            <span className="mt-1 text-sm text-red-500">
              {errors[name]?.message}
            </span>
          )}
        </div>
      )
    },
    [control, isSubmitting, errors, handleRadarIdsChange],
  )

  return (
    <>
      <Card className="mb-0 w-full max-w-screen-md p-4">
        <h1 className="text-lg font-bold">Busca por Radar</h1>
      </Card>

      <Card className="flex w-full max-w-screen-md flex-col p-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid grid-cols-2 gap-x-8 gap-y-2"
        >
          {renderDateField('startDate', 'Data/Hora de Início')}
          {renderDateField('endDate', 'Data/Hora de Fim', true)}
          {renderInputField('plate', 'Placa', 'Digite a placa do veículo')}
          {renderInputField(
            'radarIds',
            'Radar',
            'Digite o código do radar',
            true,
          )}

          <div className="col-span-2 mt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
