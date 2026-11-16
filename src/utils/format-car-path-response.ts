import type { GetCarPathResponse } from '@/http/cars/path/get-car-path'
import type { Point, Trip } from '@/models/entities'
import type { Coordinates } from '@/models/utils'

import { formatLocation } from './formatLocation'
import { isCloned } from './is-cloned'

export function formatCarPathResponse(response: GetCarPathResponse) {
  const allPoints = response.flatMap((trip) => trip.locations.flat())
  const byTime = new Map(
    allPoints.map((point) => [new Date(point.datahora).getTime(), point]),
  )
  const staysByStart = new Map(
    allPoints
      .filter((point) => point.parado && point.inicio_permanencia)
      .map((point) => [new Date(point.inicio_permanencia!).getTime(), point]),
  )

  const trips: Trip[] = response.map((trips, i) => {
    const pointSet = new Set<string>()
    const points = trips.locations.flat()
    const firstPoint = points[0]
    // Repeat the sequence's initial reading in the next trip without removing
    // it from the preceding trip. Use the query's start, not the previous row.
    if (firstPoint?.parado && firstPoint.inicio_permanencia) {
      const startTime = new Date(firstPoint.inicio_permanencia).getTime()
      const initialPoint = byTime.get(startTime)
      if (initialPoint && startTime < new Date(firstPoint.datahora).getTime()) {
        points.unshift({
          ...initialPoint,
          seconds_to_next_point:
            (new Date(firstPoint.datahora).getTime() - startTime) / 1000,
        })
      }
    }
    let tripCloneAlert = false

    const formattedPoints = points
      .map((point, index) => {
        const stay = point.parado
          ? point
          : staysByStart.get(new Date(point.datahora).getTime())
        const { location, direction, lane } = formatLocation(
          point.localidade ?? '',
        )
        const directionFromApi = point.sentido?.trim()
        const directionValue = directionFromApi ?? direction
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
          cetRioCode: point.id_ponto_coleta,
          from,
          to,
          endTime: points.at(index + 1)?.datahora,
          district: point.bairro,
          location,
          direction: directionValue,
          speed: point.velocidade,
          lane,
          secondsToNextPoint: point.seconds_to_next_point,
          cloneAlert: false,
          possibleStay: !!stay,
          possibleStayToNext:
            !!points[index + 1]?.parado &&
            !!points[index + 1]?.inicio_permanencia &&
            new Date(points[index + 1].inicio_permanencia!).getTime() ===
              new Date(point.datahora).getTime(),
          stayDurationMinutes: stay?.minutos_parado ?? 0,
          // The query counts subsequent readings; include the first reading too.
          stayDetectionCount: (stay?.total_deteccoes_parado ?? 0) + 1,
          latitude: point.latitude,
          longitude: point.longitude,
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

  return trips.reverse().map((trip, index) => ({
    ...trip,
    index,
  }))
}
