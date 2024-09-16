import { useSearchParams } from 'next/navigation'
import { z } from 'zod'

export interface FormattedSearchParams {
  plateHint: string | undefined
  date: string | undefined
  duration: number[] | undefined
  radarIds: string[] | undefined
}

type CarPathsQueryKey = ['cars', 'radar', FormattedSearchParams]

interface UseCarPathsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: CarPathsQueryKey
}

export function useCarRadarSearchParams(): UseCarPathsSearchParamsReturn {
  const searchParams = useSearchParams()

  const plateHint = searchParams.get('plateHint') || undefined
  const date = searchParams.get('date') || undefined
  const duration =
    searchParams.getAll('duration').length > 0
      ? z.array(z.coerce.number()).parse(searchParams.getAll('duration'))
      : undefined
  const radarIds =
    searchParams.getAll('radarIds').length > 0
      ? searchParams.getAll('radarIds')
      : undefined

  const formattedSearchParams: FormattedSearchParams = {
    plateHint,
    date,
    duration,
    radarIds,
  }

  const queryKey: CarPathsQueryKey = ['cars', 'radar', formattedSearchParams]

  return {
    searchParams,
    formattedSearchParams,
    queryKey,
  }
}
