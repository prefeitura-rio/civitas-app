'use server'

import { api } from '@/lib/api'

export interface GetCarHintRequest {
  plate: string
  startTime: string
  endTime: string
  minLat?: number
  maxLat?: number
  minLon?: number
  maxLon?: number
}

export async function getCarHint(props: GetCarHintRequest) {
  const response = await api.get<string[]>('/cars/hint', {
    params: {
      placa: props.plate,
      start_time: props.startTime,
      end_time: props.endTime,
      latitude_min: props?.minLat,
      latitude_max: props?.maxLat,
      longitude_min: props?.minLon,
      longitude_max: props?.maxLon,
    },
  })
  return response.data
}
