/**
 * Returns display positions matching the legacy LPR diagonal separation.
 * Coordinates are [longitude, latitude] in degrees. Points are grouped by the
 * original 0.0001-degree grid; each subsequent point is shifted east in
 * longitude and south in latitude by 0.00001 degrees per index. Input points
 * and their original coordinates remain unchanged.
 */
export function getCoincidentPointOffsets<T>(
  points: readonly T[],
  getCoordinates: (point: T) => readonly [number, number],
): Map<T, [number, number]> {
  const counts = new Map<string, number>()
  const positions = new Map<T, [number, number]>()
  for (const point of points) {
    const [longitude, latitude] = getCoordinates(point)
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue
    const key = `${Math.floor(longitude * 10000)},${Math.floor(latitude * 10000)}`
    const index = counts.get(key) ?? 0
    counts.set(key, index + 1)
    positions.set(point, [
      longitude + 0.00001 * index,
      latitude - 0.00001 * index,
    ])
  }
  return positions
}
