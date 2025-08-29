import { useQuery } from '@tanstack/react-query'

import { getVehiclesCreditsRequired } from '@/http/cars/plates/get-vehicle-credits-required'

export function useVehiclesCreditsRequired(plates: string[]) {
  return useQuery({
    queryKey: ['cars', 'plates', 'credit', ...plates],
    queryFn: () => getVehiclesCreditsRequired(plates),
    enabled: plates.length > 0,
  })
}
