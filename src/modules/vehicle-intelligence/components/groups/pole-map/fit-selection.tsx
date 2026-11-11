import { latLngBounds } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/** Com um polo aberto, mostra ele e os ligados se estiverem fora da vista (com animação: o mapa já está montado). */
export function FitSelection({
  points,
}: {
  points: Array<[number, number]> | null
}) {
  const map = useMap()
  useEffect(() => {
    if (!points?.length) return
    const bounds = latLngBounds(points)
    if (!map.getBounds().contains(bounds))
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
  }, [map, points])
  return null
}
