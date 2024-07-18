import { api } from '@/lib/api'

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
  const response = api.get<string[]>('/cars/radar', {
    params: {
      radar,
      start_time: startTime,
      end_time: endTime,
      plate_hint: plateHint,
    },
  })

  return response
}
