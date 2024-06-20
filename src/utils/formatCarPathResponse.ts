import type { GetCarPathResponse } from '@/http/cars/get-car-path'

import { formatLocation } from './formatLocation'

export interface Point {
  date: string
  cameraNumber: string
  latitude: number
  longitude: number
  district: string
  location: string
  direction: string
  lane: string
  secondsToNextPoint: number | null
}

export interface Trip {
  points: Point[]
}

export function formatCarPathResponse(response: GetCarPathResponse) {
  const trips: Trip[] = response.map((trips) => {
    const pointSet = new Set<Point>()
    return {
      points: trips.locations
        .flat()
        .map((point) => {
          const { location, direction, lane } = formatLocation(point.localidade)
          return {
            date: point.datahora,
            cameraNumber: point.camera_numero,
            latitude: point.latitude,
            longitude: point.longitude,
            district: point.bairro,
            location,
            direction,
            lane,
            secondsToNextPoint: point.seconds_to_next_point,
          }
        })
        .filter((point) => {
          if (!pointSet.has(point)) {
            pointSet.add(point)
            return true
          }
          return false
        }),
    }
  })

  return trips
}
