import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import { PENDING_CADASTRO_FILTER_ID } from '@/app/(app)/placas-monitoradas/components/monitored-plates-filter/pending-cadastro-filter'

type MonitoredPlatesQueryKey = [
  'monitored-plates',
  plateContains?: string,
  institutionAuthorityId?: string,
  withoutAuthorities?: boolean,
  notificationChannelId?: string,
  active?: boolean,
  page?: number,
  size?: number,
  startTimeCreate?: string,
  endTimeCreate?: string,
]

export interface FormattedSearchParams {
  plateContains?: string
  institutionAuthorityId?: string
  withoutAuthorities?: boolean
  notificationChannelId?: string
  active?: boolean
  page?: number
  size?: number
  startTimeCreate?: string
  endTimeCreate?: string
}

interface UseMonitoredPlatesSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: MonitoredPlatesQueryKey
  handlePaginate: (index: number) => void
}

function readDateParam(searchParams: URLSearchParams, key: 'start' | 'end') {
  if (key === 'start') {
    return (
      searchParams.get('startTimeCreate') ||
      searchParams.get('createdAtFrom') ||
      undefined
    )
  }

  return (
    searchParams.get('endTimeCreate') ||
    searchParams.get('createdAtTo') ||
    undefined
  )
}

export function useMonitoredPlatesSearchParams(): UseMonitoredPlatesSearchParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const plateContains = searchParams.get('plateContains') || undefined
  const rawInstitutionAuthorityId =
    searchParams.get('institutionAuthorityId') || undefined
  const isNoneAuthorityFilter =
    rawInstitutionAuthorityId === PENDING_CADASTRO_FILTER_ID
  const institutionAuthorityId = isNoneAuthorityFilter
    ? undefined
    : rawInstitutionAuthorityId
  const withoutAuthorities = isNoneAuthorityFilter // TODO(pending-cadastro)
  const notificationChannelId =
    searchParams.get('notificationChannelId') || undefined

  const pActive = searchParams.get('active')
  // Default: only plates with ≥1 active authority link.
  // Unlinked plates have no active links, so skip this when filtering them.
  const active = isNoneAuthorityFilter
    ? undefined
    : pActive === null || pActive === 'true'
      ? true
      : pActive === 'false'
        ? false
        : undefined

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')

  const startTimeCreate = readDateParam(searchParams, 'start')
  const endTimeCreate = readDateParam(searchParams, 'end')

  function buildParams(nextPage?: number) {
    const params = new URLSearchParams()
    if (plateContains) params.set('plateContains', plateContains)
    if (isNoneAuthorityFilter)
      params.set('institutionAuthorityId', PENDING_CADASTRO_FILTER_ID)
    else if (institutionAuthorityId)
      params.set('institutionAuthorityId', institutionAuthorityId)
    if (notificationChannelId)
      params.set('notificationChannelId', notificationChannelId)
    if (pActive === 'all') params.set('active', 'all')
    else if (typeof active !== 'undefined') params.set('active', String(active))
    if (nextPage) params.set('page', nextPage.toString())
    if (size && size !== 10) params.set('size', size.toString())
    if (startTimeCreate) params.set('startTimeCreate', startTimeCreate)
    if (endTimeCreate) params.set('endTimeCreate', endTimeCreate)
    return params
  }

  function handlePaginate(index: number) {
    const params = buildParams(index)
    router.push(`${pathName}?${params.toString()}`)
  }

  return {
    searchParams,
    handlePaginate,
    formattedSearchParams: {
      plateContains,
      institutionAuthorityId,
      withoutAuthorities,
      notificationChannelId,
      active,
      page,
      size,
      startTimeCreate,
      endTimeCreate,
    },
    queryKey: [
      'monitored-plates',
      plateContains,
      rawInstitutionAuthorityId,
      withoutAuthorities,
      notificationChannelId,
      active,
      page,
      size,
      startTimeCreate,
      endTimeCreate,
    ],
  }
}
