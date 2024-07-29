import type { Coordinates } from '@/models/utils'

import { haversineDistance } from './haversine-distance'

interface isCLonedProps {
  pointA: {
    coordinates: Coordinates
    dateTime: Date
  }
  pointB: {
    coordinates: Coordinates
    dateTime: Date
  }
}

export function isCloned({ pointA, pointB }: isCLonedProps) {
  const distanceInKilometers =
    haversineDistance({
      pointA: pointA.coordinates,
      pointB: pointB.coordinates,
    }) / 1000
  const intervalInHours =
    Math.abs(pointA.dateTime.getTime() - pointB.dateTime.getTime()) /
    1000 /
    60 /
    60

  if (distanceInKilometers / intervalInHours >= 110) return true

  return false
}
