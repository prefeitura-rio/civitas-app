import { useCallback, useState } from 'react'

/** Map surface dimensions in CSS pixels, as reported by DeckGL.onResize. */
export interface MapSize {
  width: number
  height: number
}

/**
 * Keeps reactive dimensions for one map, without querying the DOM or polling.
 *
 * @returns The last positive, finite size, or null before measurement/while hidden;
 * a stable DeckGL.onResize callback; and a reset callback for remounted surfaces.
 * Equal dimensions preserve their reference, avoiding redundant spatial queries.
 */
export function useMapSize() {
  const [mapSize, setMapSize] = useState<MapSize | null>(null)
  const handleResize = useCallback(({ width, height }: MapSize) => {
    setMapSize((previous) => {
      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) {
        return null
      }
      return previous?.width === width && previous.height === height
        ? previous
        : { width, height }
    })
  }, [])
  const resetMapSize = useCallback(() => setMapSize(null), [])

  return { mapSize, handleResize, resetMapSize }
}
