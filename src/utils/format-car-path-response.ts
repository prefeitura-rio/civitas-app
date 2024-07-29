import type { GetCarPathResponse } from '@/http/cars/path/get-car-path'
import type { Point, Trip } from '@/models/entities'
import type { Coordinates } from '@/models/utils'

import { formatLocation } from './formatLocation'
import { isCloned } from './is-cloned'

export function formatCarPathResponse(response: GetCarPathResponse) {
  const trips: Trip[] = response.map((trips, i) => {
    const pointSet = new Set<string>()
    const points = trips.locations.flat()
    let tripCloneAlert = false

    const formattedPoints = points
      .map((point, index) => {
        const { location, direction, lane } = formatLocation(point.localidade)
        const from = [point.longitude, point.latitude] as Coordinates
        const to =
          points.at(index + 1) &&
          ([
            points[index + 1].longitude,
            points[index + 1].latitude,
          ] as Coordinates)
        let cloneAlert = false

        const newPoint: Point = {
          index,
          startTime: point.datahora,
          cameraNumber: point.camera_numero,
          from,
          to,
          endTime: points.at(index + 1)?.datahora,
          district: point.bairro,
          location,
          direction,
          lane,
          secondsToNextPoint: point.seconds_to_next_point,
          cloneAlert: false,
        }

        if (newPoint.to && newPoint.endTime) {
          cloneAlert = isCloned({
            pointA: {
              coordinates: newPoint.from,
              dateTime: new Date(newPoint.startTime),
            },
            pointB: {
              coordinates: newPoint.to,
              dateTime: new Date(newPoint.endTime),
            },
          })
        }

        if (!tripCloneAlert) {
          tripCloneAlert = cloneAlert
        }

        return {
          ...newPoint,
          cloneAlert,
        } as Point
      })
      .filter((point) => {
        const key = point.from.toString() + point.startTime.toString()
        if (!pointSet.has(key)) {
          pointSet.add(key)
          return true
        }
        return false
      })

    return {
      index: i,
      points: formattedPoints,
      cloneAlert: tripCloneAlert,
    }
  })

  return trips
}
