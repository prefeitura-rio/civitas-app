import { useSearchParams } from 'next/navigation'

import { radarSearchSchema } from '@/app/(app)/veiculos/components/validationSchemas'

export interface FormattedSearchParams {
  plate?: string
  date: {
    from: string
    to: string
  }
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
    const dateFrom = searchParams.get('date.from')
    const dateTo = searchParams.get('date.to')
    const radarIds = searchParams.getAll('radarIds')

    if (dateFrom === null || dateTo === null || radarIds.length === 0) {
      throw new Error('Invalid search parameters')
    }

    const params = {
      plate,
      date: {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      },
      radarIds,
    }
    const result = radarSearchSchema.parse(params)

    const formattedSearchParams = {
      ...result,
      date: {
        from: result.date.from.toISOString(),
        to: result.date.to.toISOString(),
      },
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
