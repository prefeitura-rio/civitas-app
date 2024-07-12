import { useSearchParams } from 'next/navigation'
import { z } from 'zod'

type CarPathsQueryKey = ['cars/path', plate: string, from: string, to: string]

export interface FormattedSearchParams {
  plate: string
  from: string
  to: string
}
interface UseCarPathsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: CarPathsQueryKey
}

export function useCarPathsSearchParams(): UseCarPathsSearchParamsReturn {
  const searchParams = useSearchParams()

  const plate = z.string().parse(searchParams.get('plate'))
  const from = z.string().parse(searchParams.get('from'))
  const to = z.string().parse(searchParams.get('to'))

  return {
    searchParams,
    formattedSearchParams: {
      plate,
      from,
      to,
    },
    queryKey: ['cars/path', plate, from, to],
  }
}
