import { latLngBounds } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

import type { LatLng } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import { prefersReducedMotion } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'

/** Enquadra os pontos; com animação, avisa quando o movimento termina. */
export function MapViewport({
  points,
  active,
  animate = false,
  onSettled,
}: {
  points: LatLng[]
  active: boolean
  animate?: boolean
  onSettled?: () => void
}) {
  const map = useMap()
  const applied = useRef<LatLng[] | null>(null)
  useEffect(() => {
    if (!active || applied.current === points) return
    applied.current = points
    map.invalidateSize({ pan: false })
    const shouldAnimate = animate && !prefersReducedMotion()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      onSettled?.()
    }
    map.once('moveend', finish)
    if (points.length === 1)
      map.setView(points[0], 16, { animate: shouldAnimate, duration: 0.3 })
    else if (points.length > 1)
      map.fitBounds(latLngBounds(points), {
        padding: [40, 40],
        maxZoom: 16,
        animate: shouldAnimate,
        duration: 0.3,
      })
    const fallback = window.setTimeout(finish, shouldAnimate ? 420 : 0)
    return () => {
      window.clearTimeout(fallback)
      map.off('moveend', finish)
    }
  }, [active, animate, map, onSettled, points])
  return null
}
