import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type MonitoredPlatesQueryKey = [
  'cars',
  'monitored',
  plateContains?: string,
  operationTitle?: string,
  NotificationChannelTitle?: string,
  active?: boolean,
  page?: number,
  size?: number,
  createdAtFrom?: string,
  createdAtTo?: string,
]

export interface FormattedSearchParams {
  plateContains?: string
  operationTitle?: string
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
  const operationTitle = searchParams.get('operationTitle') || undefined
  const notificationChannelTitle =
    searchParams.get('notificationChannelTitle') || undefined

  const pActive = searchParams.get('active')
  const active = pActive === null ? undefined : pActive === 'true'

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')

  const createdAtFrom = searchParams.get('createdAtFrom') || undefined
  const createdAtTo = searchParams.get('createdAtTo') || undefined

  function handlePaginate(index: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (plateContains) params.set('plateContains', plateContains)
    if (operationTitle) params.set('operationTitle', operationTitle)
    if (notificationChannelTitle)
      params.set('notificationChannelTitle', notificationChannelTitle)
    if (typeof active !== 'undefined') params.set('active', String(active))
    if (page) params.set('page', index.toString())
    if (size) params.set('size', size.toString())

    router.push(`${pathName}?${params.toString()}`)
  }

  return {
    searchParams,
    handlePaginate,
    formattedSearchParams: {
      plateContains,
      operationTitle,
      notificationChannelTitle,
      active,
      page,
      size,
      createdAtFrom,
      createdAtTo,
    },
    queryKey: [
      'cars',
      'monitored',
      plateContains,
      operationTitle,
      notificationChannelTitle,
      active,
      page,
      size,
      createdAtFrom,
      createdAtTo,
    ],
  }
}
