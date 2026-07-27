import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type MonitoredPlatesQueryKey = [
  'monitored-plates',
  plateContains?: string,
  institutionAuthorityName?: string,
  notificationChannelTitle?: string,
  active?: boolean,
  page?: number,
  size?: number,
  createdAtFrom?: string,
  createdAtTo?: string,
]

export interface FormattedSearchParams {
  plateContains?: string
  institutionAuthorityName?: string
  notificationChannelTitle?: string
  active?: boolean
  page?: number
  size?: number
  createdAtFrom?: string
  createdAtTo?: string
}
interface UseMonitoredPlatesSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: MonitoredPlatesQueryKey
  handlePaginate: (index: number) => void
}

export function useMonitoredPlatesSearchParams(): UseMonitoredPlatesSearchParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const plateContains = searchParams.get('plateContains') || undefined
  const institutionAuthorityName =
    searchParams.get('institutionAuthorityName') || undefined
  const notificationChannelTitle =
    searchParams.get('notificationChannelTitle') || undefined

  const pActive = searchParams.get('active')
  // Default: only plates with ≥1 active authority link
  const active =
    pActive === null || pActive === 'true'
      ? true
      : pActive === 'false'
        ? false
        : undefined

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')

  const createdAtFrom = searchParams.get('createdAtFrom') || undefined
  const createdAtTo = searchParams.get('createdAtTo') || undefined

  function buildParams(nextPage?: number) {
    const params = new URLSearchParams()
    if (plateContains) params.set('plateContains', plateContains)
    if (institutionAuthorityName)
      params.set('institutionAuthorityName', institutionAuthorityName)
    if (notificationChannelTitle)
      params.set('notificationChannelTitle', notificationChannelTitle)
    if (pActive === 'all') params.set('active', 'all')
    else if (typeof active !== 'undefined') params.set('active', String(active))
    if (nextPage) params.set('page', nextPage.toString())
    if (size) params.set('size', size.toString())
    if (createdAtFrom) params.set('createdAtFrom', createdAtFrom)
    if (createdAtTo) params.set('createdAtTo', createdAtTo)
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
      institutionAuthorityName,
      notificationChannelTitle,
      active,
      page,
      size,
      createdAtFrom,
      createdAtTo,
    },
    queryKey: [
      'monitored-plates',
      plateContains,
      institutionAuthorityName,
      notificationChannelTitle,
      active,
      page,
      size,
      createdAtFrom,
      createdAtTo,
    ],
  }
}
