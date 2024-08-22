import { useQuery } from '@tanstack/react-query'

import { getReportsCategories } from '@/http/reports/get-reports-categories'
import { getReportsSources } from '@/http/reports/get-reports-sources'
import { getReportsSubtypes } from '@/http/reports/get-reports-subtypes'
import { getReportsTypes } from '@/http/reports/get-reports-types'

export function useReportFilterOptions() {
  const { data: categories, isLoading: categoriesIsLoading } = useQuery({
    queryKey: ['reports', 'categories'],
    queryFn: getReportsCategories,
  })

  const { data: sources, isLoading: sourcesIsLoading } = useQuery({
    queryKey: ['reports', 'sources'],
    queryFn: getReportsSources,
  })

  const { data: types, isLoading: typesIsLoading } = useQuery({
    queryKey: ['reports', 'types'],
    queryFn: getReportsTypes,
  })

  const { data: subtypes, isLoading: subtypesIsLoading } = useQuery({
    queryKey: ['reports', 'subtypes'],
    queryFn: getReportsSubtypes,
  })

  return {
    categories,
    sources,
    types,
    subtypes,
    states: {
      categoriesIsLoading,
      sourcesIsLoading,
      typesIsLoading,
      subtypesIsLoading,
    },
  }
}
