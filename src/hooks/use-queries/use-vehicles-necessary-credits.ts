import { useQuery } from '@tanstack/react-query'

import { getVehiclesNecessaryCredit } from '@/http/cars/plates/get-vehicle-necessary-credit'

export function useVehiclesNecessaryCredits(plates: string[]) {
  return useQuery({
    queryKey: ['cars', 'plates', 'credit', ...plates],
    queryFn: () => getVehiclesNecessaryCredit(plates),
    enabled: plates.length > 0,
  })
}
