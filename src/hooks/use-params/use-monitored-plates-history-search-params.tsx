import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import type { GetMonitoredPlatesHistoryProps } from '@/http/cars/monitored/get-monitored-plates-history'

type MonitoredPlatesQueryKey = [
  'cars',
  'monitored',
  'history',
  params: GetMonitoredPlatesHistoryProps,
]

interface UseMonitoredPlatesSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: GetMonitoredPlatesHistoryProps
  queryKey: MonitoredPlatesQueryKey
  handlePaginate: (index: number) => void
}

export function useMonitoredPlatesHistorySearchParams(): UseMonitoredPlatesSearchParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const plate = searchParams.get('plate') || undefined
  const startTimeCreate = searchParams.get('startTimeCreate') || undefined
  const endTimeCreate = searchParams.get('endTimeCreate') || undefined
  const startTimeDelete = searchParams.get('startTimeDelete') || undefined
  const endTimeDelete = searchParams.get('endTimeDelete') || undefined

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')

  const formattedSearchParams: GetMonitoredPlatesHistoryProps = {
    plate,
    startTimeCreate,
    endTimeCreate,
    startTimeDelete,
    endTimeDelete,
    page,
    size,
  }

  function handlePaginate(index: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (plate) params.set('plate', plate)
    if (startTimeCreate) params.set('startTimeCreate', startTimeCreate)
    if (endTimeCreate) params.set('endTimeCreate', endTimeCreate)
    if (startTimeDelete) params.set('startTimeDelete', startTimeDelete)
    if (endTimeDelete) params.set('endTimeDelete', endTimeDelete)

    if (page) params.set('page', index.toString())
    if (size) params.set('size', size.toString())

    router.push(`${pathName}?${params.toString()}`)
  }

  return {
    searchParams,
    handlePaginate,
    formattedSearchParams,
    queryKey: ['cars', 'monitored', 'history', formattedSearchParams],
  }
}
