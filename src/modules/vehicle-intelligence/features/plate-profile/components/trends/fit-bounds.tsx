import { latLngBounds } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

/** Enquadra os pontos uma vez por conjunto (`signature`), sem animação; um ponto só vira zoom 14.
 * Não é o FitBounds comum (components/map/fit-bounds): este centraliza o ponto único e usa recuo de
 * 46 px e zoom máximo 15, os números dos mapas do perfil. */
export function FitBounds({
  points,
  signature,
}: {
  points: [number, number][]
  signature?: string
}) {
  const map = useMap()
  const boundsSignature =
    signature ||
    points
      .map(
        ([latitude, longitude]) =>
          `${latitude.toFixed(5)},${longitude.toFixed(5)}`,
      )
      .join('|')
  const lastSignature = useRef<string | null>(null)
  useEffect(() => {
    if (!points.length || lastSignature.current === boundsSignature) return
    lastSignature.current = boundsSignature
    map.invalidateSize({ pan: false })
    if (points.length === 1) map.setView(points[0], 14, { animate: false })
    else
      map.fitBounds(latLngBounds(points), {
        padding: [46, 46],
        maxZoom: 15,
        animate: false,
      })
    const timer = window.setTimeout(() => map.invalidateSize({ pan: false }), 0)
    return () => window.clearTimeout(timer)
  }, [boundsSignature, map, points])
  return null
}
