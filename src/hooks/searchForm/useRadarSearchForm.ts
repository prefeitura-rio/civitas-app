import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import {
  type RadarSearchFormData,
  radarSearchSchema,
} from '@/app/(app)/veiculos/components/validationSchemas'
import type { Radar } from '@/models/entities'
import { toQueryParams } from '@/utils/to-query-params'

import { useRadarSync } from './useRadarSync'
import { useTimeValidation } from './useTimeValidation'

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000
const MIN_DATE = new Date(2024, 5, 1)
const MAX_DATE = new Date()

interface UseRadarSearchFormProps {
  selectedObjects: Radar[]
  setSelectedObjects: (radars: Radar[] | ((prev: Radar[]) => Radar[])) => void
  radars: Radar[] | undefined
  formattedSearchParams: {
    radarIds: string[]
    date?: { from: string; to: string }
    plate?: string
  } | null
}

export function useRadarSearchForm({
  selectedObjects,
  setSelectedObjects,
  radars,
  formattedSearchParams,
}: UseRadarSearchFormProps) {
  const router = useRouter()

  const defaultValues = useMemo(
    () => ({
      startDate: formattedSearchParams?.date?.from
        ? new Date(formattedSearchParams.date.from)
        : new Date(new Date().setSeconds(0, 0)),
      endDate: formattedSearchParams?.date?.to
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

  const timeValidation = useTimeValidation(startDate, endDate)

  useRadarSync({
    selectedObjects,
    setSelectedObjects,
    radars,
    formattedSearchParams,
    setValue: setValue as (name: string, value: string[]) => void,
  })

  useEffect(() => {
    if (startDate) {
      const newEndDate = new Date(startDate.getTime() + FIVE_HOURS_MS)
      setValue('endDate', newEndDate)
    }
  }, [startDate, setValue])

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

  return {
    control,
    handleSubmit: handleSubmit(handleFormSubmit),
    isSubmitting,
    errors,
    timeValidation,
    MIN_DATE,
    MAX_DATE,
  }
}
