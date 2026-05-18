import { useQuery } from '@tanstack/react-query'

import {
  getCirculationIndicators,
  type GetCirculationIndicatorsRequest,
} from '@/http/cars/circulation-indicators/get-circulation-indicators'

export function useCirculationIndicators({
  plate,
  startTime,
  endTime,
  maxTimeInterval,
}: GetCirculationIndicatorsRequest) {
  return useQuery({
    queryKey: [
      'cars',
      'circulation-indicators',
      plate,
      startTime,
      endTime,
      maxTimeInterval,
    ],
    queryFn: () =>
      getCirculationIndicators({
        plate,
        startTime,
        endTime,
        maxTimeInterval,
      }),
    refetchOnWindowFocus: false,
    retry: false,
  })
}
