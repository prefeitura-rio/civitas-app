import { useQuery } from '@tanstack/react-query'

import { getVehicle } from '@/http/cars/plate/get-vehicle'

export function useVehicle(plate: string, enabled = true) {
  return useQuery({
    queryKey: ['cars', 'plate', plate],
    queryFn: () => getVehicle(plate),
    enabled: Boolean(plate) && enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}
