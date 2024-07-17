import { api } from '@/lib/api'

interface GerCarHintRequest {
  plate: string
  startTime: string
  endTime: string
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export function getCarHint(props: GerCarHintRequest) {
  const response = api.get('/cars/hint', {
    params: {
      placa: props.plate,
      start_time: props.startTime,
      end_time: props.endTime,
      latitude_min: props.minLat,
      latitude_max: props.maxLat,
      longitude_min: props.minLon,
      longitude_max: props.maxLon,
    },
  })
  return response
}
