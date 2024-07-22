import { api } from '@/lib/api'
import type { RadarRegistry } from '@/models/entities'

interface GetCarsByRadarRequest {
  radar: string
  startTime: string
  endTime: string
  plateHint?: string
}

export function getCarsByRadar({
  radar,
  startTime,
  endTime,
  plateHint,
}: GetCarsByRadarRequest) {
  const response = api.get<RadarRegistry[]>('/cars/radar', {
    params: {
      radar,
      start_time: startTime,
      end_time: endTime,
      plate_hint: plateHint,
    },
  })

  return response
}
