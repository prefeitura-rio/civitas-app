import { api } from '@/lib/api'

export const periodsLabels = {
  madrugada: 'Madrugada',
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
} as const

export type Period = keyof typeof periodsLabels

export interface GetCirculationIndicatorsRequest {
  plate: string
  startTime: string
  endTime: string
  maxTimeInterval?: number
}

export interface TopLocationIndicator {
  localidade: string
  detections: number
}

export interface TopNeighborhoodIndicator {
  bairro: string
  detections: number
}

export interface NeighborhoodWithMostDistinctTripsIndicator {
  bairro: string
  distinct_trips: number
}

export interface DetectionCountByPeriod {
  period: Period
  detections: number
}

export interface GetCirculationIndicatorsResponse {
  top_location: TopLocationIndicator | null
  top_neighborhoods: TopNeighborhoodIndicator[]
  neighborhood_with_most_distinct_trips: NeighborhoodWithMostDistinctTripsIndicator | null
  time_periods: DetectionCountByPeriod[]
  top_time_period: DetectionCountByPeriod | null
}

export async function getCirculationIndicators({
  plate,
  startTime,
  endTime,
  maxTimeInterval,
}: GetCirculationIndicatorsRequest) {
  const response = await api.get<GetCirculationIndicatorsResponse>(
    'cars/circulation-indicators',
    {
      params: {
        placa: plate,
        start_time: startTime,
        end_time: endTime,
        max_time_interval: maxTimeInterval,
      },
    },
  )

  return response.data
}
