import { useSearchParams } from 'next/navigation'

export interface FormattedSearchParams {
  plate: string | undefined
  from: string | undefined
  to: string | undefined
}

type CarPathsQueryKey = ['cars', 'path', FormattedSearchParams]

interface UseCarPathsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: CarPathsQueryKey
}

export function useCarPathsSearchParams(): UseCarPathsSearchParamsReturn {
  const searchParams = useSearchParams()

  const plate =
    searchParams.get('plateHint') || searchParams.get('plate') || undefined
  const from = searchParams.get('from') || undefined
  const to = searchParams.get('to') || undefined

  const formattedSearchParams: FormattedSearchParams = {
    plate,
    from,
    to,
  }

  const queryKey: CarPathsQueryKey = ['cars', 'path', formattedSearchParams]

  return {
    searchParams,
    formattedSearchParams,
    queryKey,
  }
}
