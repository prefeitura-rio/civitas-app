import { api } from '@/lib/api'
import type { RadarDetection } from '@/models/entities'

interface GetCarsByRadarRequest {
  radar: string
  startTime: string
  endTime: string
  plateHint?: string
}

export async function getCarsByRadar({
  radar,
  startTime,
  endTime,
  plateHint,
}: GetCarsByRadarRequest) {
  const response = await api.get<RadarDetection[]>('/cars/radar', {
    params: {
      radar,
      start_time: startTime,
      end_time: endTime,
      plate_hint: plateHint,
    },
  })

  return response.data
}
