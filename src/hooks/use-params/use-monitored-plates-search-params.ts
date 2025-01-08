import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type MonitoredPlatesQueryKey = [
  'cars',
  'monitored',
  plateContains?: string,
  operationTitle?: string,
  NotificationChannelTitle?: string,
  page?: number,
  size?: number,
]

export interface FormattedSearchParams {
  plateContains?: string
  operationTitle?: string
  notificationChannelTitle?: string
  page?: number
  size?: number
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

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')

  function handlePaginate(index: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (plateContains) params.set('plateContains', plateContains)
    if (operationTitle) params.set('operationTitle', operationTitle)
    if (notificationChannelTitle)
      params.set('notificationChannelTitle', notificationChannelTitle)
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
      page,
      size,
    },
    queryKey: [
      'cars',
      'monitored',
      plateContains,
      operationTitle,
      notificationChannelTitle,
      page,
      size,
    ],
  }
}
