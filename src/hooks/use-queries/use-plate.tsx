import { useQuery } from '@tanstack/react-query'

import { getPlateInfo } from '@/http/cars/plate/get-plate-info'

export function usePlate(plate: string) {
  return useQuery({
    queryKey: ['cortex', 'plate-info', plate],
    queryFn: async () => getPlateInfo(plate),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}
