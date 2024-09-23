import { useQuery } from '@tanstack/react-query'

import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'
import type { RadarDetection, Vehicle } from '@/models/entities'

import { useCarRadarSearchParams } from '../use-params/use-car-radar-search-params.'
import { useRadars } from './use-radars'

export type Detection = RadarDetection &
  Vehicle & {
    cameraNumber: string
    location: string
    lane: string
  }

export function useRadarsSearch() {
  const { formattedSearchParams, queryKey } = useCarRadarSearchParams()
  const { data: radars } = useRadars()

  if (!formattedSearchParams) throw new Error('Missing search params')

  const radarIds = formattedSearchParams.radarIds
  const startTime = new Date(formattedSearchParams.date)
    .addMinutes(formattedSearchParams.duration[0])
    .toISOString()
  const endTime = new Date(formattedSearchParams.date)
    .addMinutes(formattedSearchParams.duration[1])
    .toISOString()
  const plateHint = formattedSearchParams.plate

  return useQuery({
    queryKey,
    queryFn: async () => {
      const filteredRadars =
        radars?.filter(
          (radar) =>
            radarIds.includes(radar.cameraNumber) ||
            (radar.cetRioCode && radarIds.includes(radar?.cetRioCode)),
        ) || []

      const result = await Promise.all(
        filteredRadars.map(async (radar) => {
          const detections = await getCarsByRadar({
            radar: radar.cameraNumber,
            startTime,
            endTime,
            plateHint,
          })

          const joinedData = detections.map((detection) => {
            return {
              ...detection, // plate, timestamp, speed
              cameraNumber: radar.cameraNumber,
              lane: radar.lane || '',
              location: radar.location?.replace(/- FX \d+/, '') || 'N/A',
            } as Detection
          })

          return joinedData
        }),
      )

      const sortedDetections = result
        .flat()
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )

      return sortedDetections
    },
    enabled: !!radars && !!formattedSearchParams,
  })
}
