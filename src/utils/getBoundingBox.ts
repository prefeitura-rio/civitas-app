interface FindMinMaxCoordinatesReturn {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export function findMinMaxCoordinates(
  coordinates: [longitude: number, latitude: number][],
): FindMinMaxCoordinatesReturn {
  const initial = {
    minLat: coordinates[0][1],
    maxLat: coordinates[0][1],
    minLon: coordinates[0][0],
    maxLon: coordinates[0][0],
  }

  const result = coordinates.reduce((acc, [lon, lat]) => {
    return {
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
      minLon: Math.min(acc.minLon, lon),
      maxLon: Math.max(acc.maxLon, lon),
    }
  }, initial)

  return result
}
