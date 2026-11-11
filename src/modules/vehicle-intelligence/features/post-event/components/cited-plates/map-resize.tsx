import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/** Recalcula o tamanho quando a aba volta a aparecer ou o layout muda. */
export function MapResize({ active }: { active: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => map.invalidateSize({ pan: false }), 0)
    return () => window.clearTimeout(timer)
  }, [active, map])
  useEffect(() => {
    const observer = new ResizeObserver(() =>
      map.invalidateSize({ pan: false }),
    )
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}
