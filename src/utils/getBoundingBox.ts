export function findMinMaxCoordinates(
  coordinates: [longitude: number, latitude: number][],
) {
  if (!coordinates.length) {
    return null
  }

  const initial = {
    minLat: coordinates[0][1],
    maxLat: coordinates[0][1],
    minLon: coordinates[0][0],
    maxLon: coordinates[0][0],
  }

  return coordinates.reduce((acc, [lon, lat]) => {
    return {
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
      minLon: Math.min(acc.minLon, lon),
      maxLon: Math.max(acc.maxLon, lon),
    }
  }, initial)
}
