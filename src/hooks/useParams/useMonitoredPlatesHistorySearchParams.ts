import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import type {
  GetMonitoredPlatesHistoryProps,
  MonitoredPlateHistorySortBy,
  MonitoredPlateHistorySortDirection,
} from '@/http/cars/monitored/get-monitored-plates-history'

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
  handleSorting: (
    sortBy?: MonitoredPlateHistorySortBy,
    sortDirection?: MonitoredPlateHistorySortDirection,
  ) => void
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
  const sortBy = (searchParams.get('sortBy') || undefined) as
    | MonitoredPlateHistorySortBy
    | undefined
  const sortDirection = (searchParams.get('sortDirection') || undefined) as
    | MonitoredPlateHistorySortDirection
    | undefined

  const formattedSearchParams: GetMonitoredPlatesHistoryProps = {
    plate,
    startTimeCreate,
    endTimeCreate,
    startTimeDelete,
    endTimeDelete,
    page,
    size,
    sortBy,
    sortDirection,
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

  function handleSorting(
    nextSortBy?: MonitoredPlateHistorySortBy,
    nextSortDirection?: MonitoredPlateHistorySortDirection,
  ) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextSortBy && nextSortDirection) {
      params.set('sortBy', nextSortBy)
      params.set('sortDirection', nextSortDirection)
    } else {
      params.delete('sortBy')
      params.delete('sortDirection')
    }

    params.set('page', '1')
    router.push(`${pathName}?${params.toString()}`)
  }

  return {
    searchParams,
    handlePaginate,
    handleSorting,
    formattedSearchParams,
    queryKey: ['cars', 'monitored', 'history', formattedSearchParams],
  }
}
