import { useSearchParams } from 'next/navigation'

import {
  type WideSearchFormData,
  wideSearchSchema,
} from '@/app/(app)/mapa/components/search/components/validationSchemas'

export interface FormattedSearchParams {
  plate: string
  from: string
  to: string
}

type CarPathsQueryKey = ['cars', 'path', FormattedSearchParams | null]

interface UseCarPathsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams | null
  queryKey: CarPathsQueryKey
}

export function useCarPathsSearchParams(): UseCarPathsSearchParamsReturn {
  const searchParams = useSearchParams()
  try {
    const plate = searchParams.get('plate')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (plate === null || from === null || to === null) {
      throw new Error('Invalid search parameters')
    }

    const params: WideSearchFormData = {
      date: {
        from: new Date(from),
        to: new Date(to),
      },
      plate,
    }

    wideSearchSchema.parse(params)

    const formattedSearchParams: FormattedSearchParams = {
      plate,
      from,
      to,
    }

    return {
      searchParams,
      formattedSearchParams,
      queryKey: ['cars', 'path', formattedSearchParams],
    }
  } catch {
    const formattedSearchParams = null

    return {
      searchParams,
      formattedSearchParams,
      queryKey: ['cars', 'path', formattedSearchParams],
    }
  }
}
