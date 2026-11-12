import { latLngBounds, type Map as LeafletMap } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

import { prefersReducedMotion } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'

export function MapViewport({
  points,
  animate = false,
  detailPanelOpen = false,
  onViewSettled,
}: {
  points: Array<[number, number]>
  animate?: boolean
  detailPanelOpen?: boolean
  onViewSettled?: (map: LeafletMap) => void
}) {
  const map = useMap()
  const previousPointsRef = useRef<Array<[number, number]> | null>(null)
  useEffect(() => {
    if (previousPointsRef.current === points) return
    previousPointsRef.current = points
    const shouldAnimate = animate && !prefersReducedMotion()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      onViewSettled?.(map)
    }
    if (onViewSettled) map.once('moveend', finish)
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: shouldAnimate, duration: 0.18 })
    }
    if (points.length > 1) {
      const desktopPanelOpen =
        detailPanelOpen && !window.matchMedia('(max-width: 700px)').matches
      map.fitBounds(latLngBounds(points), {
        paddingTopLeft: [35, 35],
        paddingBottomRight: desktopPanelOpen ? [435, 35] : [35, 35],
        maxZoom: 14,
        animate: shouldAnimate,
        duration: 0.18,
      })
    }
    const fallback = window.setTimeout(finish, shouldAnimate ? 280 : 0)
    return () => {
      window.clearTimeout(fallback)
      map.off('moveend', finish)
    }
  }, [animate, detailPanelOpen, map, onViewSettled, points])
  return null
}
