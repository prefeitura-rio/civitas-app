import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type MonitoredPlatesQueryKey = ['cars/monitored', page?: number, size?: number]

export interface FormattedSearchParams {
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

  const page =
    z.coerce.number().parse(searchParams.get('page') ?? '1') || undefined
  const size =
    z.coerce.number().parse(searchParams.get('size') ?? '10') || undefined

  function handlePaginate(index: number) {
    router.replace(`placas-monitoradas?page=${index}`)
  }

  return {
    searchParams,
    handlePaginate,
    formattedSearchParams: {
      page,
      size,
    },
    queryKey: ['cars/monitored', page, size],
  }
}
