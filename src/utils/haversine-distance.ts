import type { Coordinates } from '@/models/utils'

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

interface HaversineDistanceProps {
  pointA: Coordinates
  pointB: Coordinates
}

export function haversineDistance({
  pointA,
  pointB,
}: HaversineDistanceProps): number {
  const R = 6371000 // Earth's radius in meters

  const phi1 = toRadians(pointA[1])
  const phi2 = toRadians(pointB[1])
  const deltaPhi = toRadians(pointB[1] - pointA[1])
  const deltaLambda = toRadians(pointB[0] - pointA[0])

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
