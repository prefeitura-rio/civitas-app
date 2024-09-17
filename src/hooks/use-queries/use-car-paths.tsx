import { useQuery } from '@tanstack/react-query'

import { getCarPath } from '@/http/cars/path/get-car-path'

import { useCarPathsSearchParams } from '../use-params/use-car-paths-search-params'

export function useCarPaths() {
  const { queryKey, formattedSearchParams } = useCarPathsSearchParams()
  return useQuery({
    queryKey,
    queryFn: () =>
      getCarPath({
        plate: formattedSearchParams.plate,
        startTime: formattedSearchParams.from,
        endTime: formattedSearchParams.to,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
