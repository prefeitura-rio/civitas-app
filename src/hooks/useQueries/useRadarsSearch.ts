import { useQuery } from '@tanstack/react-query'

import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'

import { useCarRadarSearchParams } from '../useParams/useCarRadarSearchParams'
import { useRadars } from './useRadars'

export type DetectionDTO = {
  plate: string
  timestamp: string
  speed: number
  cetRioCode: string
  location: string
  lane: string
}

export function useRadarsSearch() {
  const { formattedSearchParams, queryKey } = useCarRadarSearchParams()
  const { data: radars } = useRadars()

  if (!formattedSearchParams) throw new Error('Missing search params')

  const radarIds = formattedSearchParams.radarIds
  const startTime = new Date(formattedSearchParams.date.from).toISOString()
  const endTime = new Date(formattedSearchParams.date.to).toISOString()
  const plateHint = formattedSearchParams.plate

  return useQuery({
    queryKey,
    queryFn: async () => {
      const selectedRadars =
        radars?.filter(
          (radar) =>
            radarIds.includes(radar.cetRioCode) ||
            (radar.cetRioCode && radarIds.includes(radar?.cetRioCode)),
        ) || []

      const detections = await Promise.all(
        selectedRadars.map(async (radar) => {
          const detections = await getCarsByRadar({
            radar: radar.cetRioCode,
            startTime,
            endTime,
            plateHint,
          })

          const joinedData = detections.map((detection) => {
            return {
              ...detection, // plate, timestamp, speed
              cetRioCode: radar.cetRioCode,
              lane: radar.lane || '',
              location: radar.location?.replace(/- FX \d+/, '') || 'N/A',
            } as DetectionDTO
          })

          return joinedData
        }),
      )

      const sortedDetections = detections
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
