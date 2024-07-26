import type { GetCarPathResponse } from '@/http/cars/path/get-car-path'
import type { Point, Trip } from '@/models/entities'

import { formatLocation } from './formatLocation'

export function formatCarPathResponse(response: GetCarPathResponse) {
  const trips: Trip[] = response.map((trips, i) => {
    const pointSet = new Set<Point>()
    const points = trips.locations.flat()
    return {
      index: i,
      points: points
        .map((point, index) => {
          const { location, direction, lane } = formatLocation(point.localidade)
          return {
            index,
            startTime: point.datahora,
            cameraNumber: point.camera_numero,
            from: [point.longitude, point.latitude],
            to: points.at(index + 1) && [
              points[index + 1].longitude,
              points[index + 1].latitude,
            ],
            endTime: points.at(index + 1)?.datahora,
            district: point.bairro,
            location,
            direction,
            lane,
            secondsToNextPoint: point.seconds_to_next_point,
          } as Point
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
