'use client'
import '@/utils/date-extensions'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  type RadarSearchFormData,
  radarSearchSchema,
} from '@/app/(app)/veiculos/components/validationSchemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { toQueryParams } from '@/utils/to-query-params'

import { DateField } from './date-field'
import { InputField } from './input-field'

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
  const {
    multipleSelectedRadars,
    setMultipleSelectedRadars,
    setIsMultiSelectMode,
  } = useMap()

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
  const currentRadarIds = watch('radarIds')

  // Habilitar modo de seleção múltipla quando o componente montar
  useEffect(() => {
    setIsMultiSelectMode(true)
    return () => {
      setIsMultiSelectMode(false)
      setMultipleSelectedRadars([])
    }
  }, [setIsMultiSelectMode, setMultipleSelectedRadars])

  // Sincronizar radares selecionados no mapa com o formulário
  useEffect(() => {
    if (multipleSelectedRadars.length > 0) {
      setValue('radarIds', multipleSelectedRadars)
    }
  }, [multipleSelectedRadars, setValue])

  // Sincronizar radares do formulário com o contexto do mapa
  useEffect(() => {
    if (currentRadarIds && Array.isArray(currentRadarIds)) {
      setMultipleSelectedRadars(currentRadarIds)
    }
  }, [currentRadarIds, setMultipleSelectedRadars])

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
          <DateField
            name="startDate"
            label="Data/Hora de Início"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
            minDate={MIN_DATE}
            maxDate={MAX_DATE}
          />

          <DateField
            name="endDate"
            label="Data/Hora de Fim"
            showValidation={true}
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
            timeValidation={timeValidation}
            minDate={MIN_DATE}
            maxDate={MAX_DATE}
          />

          <InputField
            name="plate"
            label="Placa"
            placeholder="Digite a placa do veículo"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
          />

          <InputField
            name="radarIds"
            label="Radar"
            placeholder="Digite o código do radar"
            isRadarIds={true}
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
          />

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
