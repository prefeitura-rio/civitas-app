import { api } from '@/lib/api'

export interface GetCarPathRequest {
  placa: string
  startTime: string
  endTime: string
}

export interface Location {
  datahora: string
  camera_numero: string
  latitude: number
  longitude: number
  bairro: string
  localidade: string
}

export interface GetCarPathResponseItem {
  locations: Location[][]
  polyline: string | null
}

export type GetCarPathResponse = GetCarPathResponseItem[]

export async function getCarPath({
  placa,
  startTime,
  endTime,
}: GetCarPathRequest) {
  console.log('DEBUG')
  const response = await api.get<GetCarPathResponse>('cars/path', {
    params: {
      placa,
      start_time: startTime,
      end_time: endTime,
    },
  })

  return response
}
