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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const radarIds = searchParams.getAll('radarIds')

    if (startDate === null || endDate === null || radarIds.length === 0) {
      throw new Error('Invalid search parameters')
    }

    const params = {
      plate,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      radarIds,
    }
    const result = radarSearchSchema.parse(params)

    const formattedSearchParams = {
      plate: result.plate,
      date: {
        from: result.startDate.toISOString(),
        to: result.endDate.toISOString(),
      },
      radarIds: result.radarIds,
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
