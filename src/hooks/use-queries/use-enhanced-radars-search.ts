import { useQuery } from '@tanstack/react-query'

import { getVehicles } from '@/http/cars/plates/get-vehicles'
import type { RadarDetection } from '@/models/entities'

import { useCarRadarSearchParams } from '../use-params/use-car-radar-search-params.'
import { useRadarsSearch } from './use-radars-search'

export type EnhancedDetectionDTO = RadarDetection & {
  brandModel: string
  color: string
  modelYear: string
  plate: string
  cameraNumber: string
  location: string
  lane: string
}

export function useEnhancedRadarsSearch() {
  const { queryKey } = useCarRadarSearchParams()
  const { data: detections } = useRadarsSearch()

  return useQuery({
    queryKey: ['enhanced-radars-search', queryKey],
    queryFn: async () => {
      const vehicles = await getVehicles(
        detections?.map((detection) => detection.plate) || [],
      )

      const enhancedDetection = detections?.map((detection) => {
        const vehicle = vehicles[0]
        return {
          ...detection,
          // TODO: Fix this
          // ...vehicles.find((vehicle) => vehicle.placa === detection.plate),
          brandModel: vehicle.marcaModelo,
          color: vehicle.cor,
          modelYear: vehicle.anoModelo,
        } as EnhancedDetectionDTO
      }) as EnhancedDetectionDTO[]

      return enhancedDetection
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: !!detections && detections.length > 0,
  })
}
