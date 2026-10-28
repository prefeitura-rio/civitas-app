import { api } from '@/lib/api'
import type { VehiclePrf } from '@/utils/vehicle-prf'

export async function getVehiclePrf(plate: string): Promise<VehiclePrf | null> {
  const { data } = await api.get<VehiclePrf | null>(
    `/cars/vehicle-prf/${encodeURIComponent(plate)}`,
  )
  return data
}
