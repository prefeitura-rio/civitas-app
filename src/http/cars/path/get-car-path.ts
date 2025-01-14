import { api } from '@/lib/api'
import { formatCarPathResponse } from '@/utils/format-car-path-response'

export interface GetCarPathRequest {
  plate: string
  startTime: string
  endTime: string
}

export interface Point {
  datahora: string
  camera_numero: string
  latitude: number
  longitude: number
  bairro: string
  localidade: string
  velocidade: number
  seconds_to_next_point: number | null
}

export interface GetCarPathResponseItem {
  locations: Point[][]
  polyline: string | null
}

export type GetCarPathResponse = GetCarPathResponseItem[]

export async function getCarPath({
  plate,
  startTime,
  endTime,
}: GetCarPathRequest) {
  const response = await api.get<GetCarPathResponse>('cars/path', {
    params: {
      placa: plate,
      start_time: startTime,
      end_time: endTime,
    },
  })

  return formatCarPathResponse(response.data)
}
