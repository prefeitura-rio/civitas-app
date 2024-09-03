import '@/utils/date-extensions'

import { redirect, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import type { GetReportsRequest } from '@/models/interfaces'

type ReportsQueryKey = ['reports', query: GetReportsRequest]

interface UseReportsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: GetReportsRequest
  queryKey: ReportsQueryKey
  handlePaginate: (index: number) => void
}

export function useReportsSearchParams(): UseReportsSearchParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()

  const params = {
    semanticallySimilar: searchParams.get('semanticallySimilar'),
    reportId: searchParams.get('reportId'),
    originalReportId: searchParams.get('originalReportId'),
    sourceIdContains: searchParams.getAll('sourceIdContains'),
    minDate: searchParams.get('minDate'),
    maxDate: searchParams.get('maxDate'),
    categoryContains: searchParams.getAll('categoryContains'),
    descriptionContains: searchParams.getAll('descriptionContains'),
    minLat: z.coerce.number().parse(searchParams.get('minLat')),
    maxLat: z.coerce.number().parse(searchParams.get('maxLat')),
    minLon: z.coerce.number().parse(searchParams.get('minLon')),
    maxLon: z.coerce.number().parse(searchParams.get('maxLon')),
    page: z.coerce.number().parse(searchParams.get('page') ?? '1'),
    size: z.coerce.number().parse(searchParams.get('size') ?? '10'),
  }

  let formattedSearchParams: GetReportsRequest = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (!Array.isArray(value) || (Array.isArray(value) && value.length > 0)) {
        formattedSearchParams = {
          ...formattedSearchParams,
          [key]: value,
        }
      }
    }
  })

  if (!formattedSearchParams.minDate || !formattedSearchParams.maxDate) {
    const defaultMinDate = new Date().addDays(-7).setMinTime()
    const defaultMaxDate = new Date().setMaxTime()
    redirect(
      `/ocorrencias/mapa/?minDate=${defaultMinDate.toISOString()}&maxDate=${defaultMaxDate.toISOString()}`,
    )
  }

  function handlePaginate(index: number) {
    const query = new URLSearchParams()

    const newParams = {
      ...params,
      page: index,
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            query.append(key, item)
          })
        } else {
          query.set(key, value.toString())
        }
      }
    })

    router.push(`ocorrencias?${query.toString()}`)
  }

  return {
    searchParams,
    formattedSearchParams,
    handlePaginate,
    queryKey: ['reports', formattedSearchParams],
  }
}
