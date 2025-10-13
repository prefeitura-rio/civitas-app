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

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000
const MIN_DATE = new Date(2024, 5, 1)
const MAX_DATE = new Date()

interface UseRadarSearchFormProps {
  selectedObjects: Radar[]
  radars: Radar[] | undefined
  formattedSearchParams: {
    radarIds: string[]
    date?: { from: string; to: string }
    plate?: string
  } | null
}

export function useRadarSearchForm({
  selectedObjects,
  radars,
  formattedSearchParams,
}: UseRadarSearchFormProps) {
  const router = useRouter()

  const defaultValues = useMemo(() => {
    const now = new Date()
    const nowRounded = new Date(now.setSeconds(0, 0))
    const fiveHoursAgo = new Date(nowRounded.getTime() - FIVE_HOURS_MS)

    return {
      startDate: formattedSearchParams?.date?.from
        ? new Date(formattedSearchParams.date.from)
        : fiveHoursAgo,
      endDate: formattedSearchParams?.date?.to
        ? new Date(formattedSearchParams.date.to)
        : nowRounded,
      plate: formattedSearchParams?.plate || '',
      radarIds: formattedSearchParams?.radarIds || [],
    }
  }, [formattedSearchParams])

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<RadarSearchFormData>({
    resolver: zodResolver(radarSearchSchema),
    defaultValues,
    mode: 'onChange',
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  useRadarSync({
    selectedObjects,
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

  useEffect(() => {
    if (startDate && endDate) {
      trigger('endDate')
    }
  }, [startDate, endDate, trigger])

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
    MIN_DATE,
    MAX_DATE,
  }
}
