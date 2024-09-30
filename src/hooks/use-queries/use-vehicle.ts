import { useQuery } from '@tanstack/react-query'

import { getVehicle } from '@/http/cars/plate/get-vehicle'

export function useVehicle(plate: string) {
  return useQuery({
    queryKey: ['cars', 'plate', plate],
    queryFn: () => getVehicle(plate),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}
