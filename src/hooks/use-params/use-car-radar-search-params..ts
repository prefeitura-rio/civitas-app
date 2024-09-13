import { useSearchParams } from 'next/navigation'
import { z } from 'zod'


export interface FormattedSearchParams {
  plate: string | undefined
  from: string
  to: string
  radarIds: string[]
}

type CarPathsQueryKey = ['cars', 'radar', FormattedSearchParams]

interface UseCarPathsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: CarPathsQueryKey
}

export function useCarRadarSearchParams(): UseCarPathsSearchParamsReturn {
  const searchParams = useSearchParams()

  const plate = z.string().optional().parse(searchParams.get('plate') || undefined)
  const from = z.string().parse(searchParams.get('from'))
  const to = z.string().parse(searchParams.get('to'))
  const radarIds = z.array(z.string()).parse(searchParams.getAll('radarIds'))

  const formattedSearchParams: FormattedSearchParams = {
    plate,
    from,
    to,
    radarIds,
  }

  const queryKey: CarPathsQueryKey = ['cars', 'radar', formattedSearchParams]

  return {
    searchParams,
    formattedSearchParams,
    queryKey,
  }
}
