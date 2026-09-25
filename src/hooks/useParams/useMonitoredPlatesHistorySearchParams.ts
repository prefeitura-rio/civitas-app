import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import type {
  GetMonitoredPlatesHistoryProps,
  MonitoredPlateHistoryEndReasonFilter,
  MonitoredPlateHistorySortBy,
  MonitoredPlateHistorySortDirection,
  MonitoredPlateHistoryStatusFilter,
} from '@/http/cars/monitored/get-monitored-plates-history'

type MonitoredPlatesQueryKey = [
  'cars',
  'monitored',
  'history',
  params: GetMonitoredPlatesHistoryProps,
]

const STATUS_OPTIONS = ['active', 'deactivated'] as const
const END_REASON_OPTIONS = ['expired', 'manual'] as const
const SORT_BY_OPTIONS = [
  'activity_timestamp',
  'plate',
  'reference_number',
  'notes',
  'created_timestamp',
  'created_by',
  'deleted_timestamp',
  'deleted_by',
  'requesting_institution_name',
  'institution_authority_name',
] as const satisfies readonly MonitoredPlateHistorySortBy[]
const SORT_DIRECTION_OPTIONS = ['asc', 'desc'] as const

function parseStatus(
  value: string | null,
): MonitoredPlateHistoryStatusFilter | undefined {
  if (
    value &&
    STATUS_OPTIONS.includes(value as MonitoredPlateHistoryStatusFilter)
  ) {
    return value as MonitoredPlateHistoryStatusFilter
  }
  return undefined
}

function parseEndReason(
  value: string | null,
): MonitoredPlateHistoryEndReasonFilter | undefined {
  if (
    value &&
    END_REASON_OPTIONS.includes(value as MonitoredPlateHistoryEndReasonFilter)
  ) {
    return value as MonitoredPlateHistoryEndReasonFilter
  }
  return undefined
}

function parseSort(
  sortByValue: string | null,
  sortDirectionValue: string | null,
): {
  sortBy?: MonitoredPlateHistorySortBy
  sortDirection?: MonitoredPlateHistorySortDirection
} {
  const sortBy = SORT_BY_OPTIONS.find((option) => option === sortByValue)
  const sortDirection = SORT_DIRECTION_OPTIONS.find(
    (option) => option === sortDirectionValue,
  )
  if (!sortBy || !sortDirection) return {}
  return { sortBy, sortDirection }
}

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
  const status = parseStatus(searchParams.get('status'))
  const referenceNumber = searchParams.get('referenceNumber') || undefined
  const requestingInstitutionId =
    searchParams.get('requestingInstitutionId') || undefined
  const institutionAuthorityId =
    searchParams.get('institutionAuthorityId') || undefined
  const endReason =
    status === 'active'
      ? undefined
      : parseEndReason(searchParams.get('endReason'))

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')
  const { sortBy, sortDirection } = parseSort(
    searchParams.get('sortBy'),
    searchParams.get('sortDirection'),
  )

  const formattedSearchParams: GetMonitoredPlatesHistoryProps = {
    plate,
    startTimeCreate,
    endTimeCreate,
    startTimeDelete,
    endTimeDelete,
    status,
    referenceNumber,
    requestingInstitutionId,
    institutionAuthorityId,
    endReason,
    page,
    size,
    sortBy,
    sortDirection,
  }

  function withCurrentParams() {
    return new URLSearchParams(searchParams.toString())
  }

  function handlePaginate(index: number) {
    const params = withCurrentParams()
    params.set('page', index.toString())
    router.push(`${pathName}?${params.toString()}`)
  }

  function handleSorting(
    nextSortBy?: MonitoredPlateHistorySortBy,
    nextSortDirection?: MonitoredPlateHistorySortDirection,
  ) {
    const params = withCurrentParams()

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
