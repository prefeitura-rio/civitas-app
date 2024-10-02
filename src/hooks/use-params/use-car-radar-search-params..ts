import { useSearchParams } from 'next/navigation'

import { radarSearchSchema } from '@/app/(app)/veiculos/components/validationSchemas'

export interface FormattedSearchParams {
  plate?: string
  date: string
  duration: number[]
  radarIds: string[]
}

type CarPathsQueryKey = ['cars', 'radar', FormattedSearchParams | null]

interface UseCarPathsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams | null
  queryKey: CarPathsQueryKey
}

export function useCarRadarSearchParams(): UseCarPathsSearchParamsReturn {
  const searchParams = useSearchParams()

  try {
    const plate = searchParams.get('plate') || undefined
    const date = searchParams.get('date')
    const duration = searchParams.getAll('duration')
    const radarIds = searchParams.getAll('radarIds')

    if (date === null || duration.length !== 2 || radarIds.length === 0) {
      throw new Error('Invalid search parameters')
    }

    const params = {
      plate,
      date: new Date(date),
      duration,
      radarIds,
    }
    const result = radarSearchSchema.parse(params)

    const formattedSearchParams = {
      ...result,
      date: result.date.toISOString(),
    }

    const queryKey: CarPathsQueryKey = ['cars', 'radar', formattedSearchParams]

    return {
      searchParams,
      formattedSearchParams,
      queryKey,
    }
  } catch (e) {
    return {
      searchParams,
      formattedSearchParams: null,
      queryKey: ['cars', 'radar', null],
    }
  }
}
