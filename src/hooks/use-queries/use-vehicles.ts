import { useQuery } from '@tanstack/react-query'

import { getVehicles } from '@/http/cars/plates/get-vehicles'

export function useVehicles(plates: string[]) {
  return useQuery({
    queryKey: ['cars', 'plate', ...plates],
    queryFn: () => getVehicles(plates),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: plates.length > 0 && plates.length <= 100,
  })
}
