import { isApiError } from '@/lib/api'

import { useVehicle } from './useVehicle'
import { useVehiclePrf } from './useVehiclePrf'

export function useReportVehicle(plate: string, enabled = true) {
  const cortex = useVehicle(plate, enabled)
  const accessBlocked =
    isApiError(cortex.error) &&
    [401, 403, 451].includes(cortex.error.response?.status ?? 0)
  const useFallback =
    enabled && !cortex.isPending && !cortex.data && !accessBlocked
  const prf = useVehiclePrf(plate, useFallback)

  return {
    cortex,
    prf,
    useFallback,
    vehicle: cortex.data ?? (useFallback ? prf.data : undefined),
    isPending: enabled && (cortex.isPending || (useFallback && prf.isPending)),
  }
}
