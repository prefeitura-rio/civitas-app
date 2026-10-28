import { useQuery } from '@tanstack/react-query'

import { getVehiclePrf } from '@/http/cars/plate/get-vehicle-prf'

export function useVehiclePrf(plate: string, enabled = true) {
  return useQuery({
    queryKey: ['cars', 'vehicle-prf', plate],
    queryFn: () => getVehiclePrf(plate),
    enabled: Boolean(plate) && enabled,
    staleTime: 30 * 24 * 60 * 60 * 1000,
    retry: false,
  })
}
