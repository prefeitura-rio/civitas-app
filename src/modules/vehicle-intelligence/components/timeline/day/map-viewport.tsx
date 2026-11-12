import { latLngBounds, point } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

import { prefersReducedMotion } from '@/modules/vehicle-intelligence/components/timeline/day/map-motion'

const PADDING = 48
/** Espaço acima da leitura para o balão (altura dele + a distância ao marcador). */
const CALLOUT_ROOM = 130
const MAX_ZOOM = 14

/**
 * Acompanha a reprodução sem sacudir o mapa a cada passo: enquadra o fato e as últimas leituras reveladas só ao
 * abrir o dia, quando a leitura em foco sai da área útil (o mapa menos as margens e o espaço do balão) ou quando dá
 * para chegar um zoom inteiro mais perto. Parado enquanto se arrasta o trilho.
 */
export function MapViewport({
  positions,
  focus,
  followView,
  dayKey,
}: {
  positions: [number, number][]
  /** A leitura (ou o fato) do passo atual; sem ela, a última posição. */
  focus: [number, number] | null
  followView: boolean
  /** Muda com o dia: o primeiro enquadramento de cada dia é sempre feito, sem animação. */
  dayKey: string
}) {
  const map = useMap()
  const fittedDay = useRef<string | null>(null)
  useEffect(() => {
    window.setTimeout(() => map.invalidateSize(), 0)
    if (!followView || !positions.length) return
    const first = fittedDay.current !== dayKey
    const animate = !first && !prefersReducedMotion()
    const size = map.getSize()
    const target = map.latLngToContainerPoint(
      focus ?? positions[positions.length - 1],
    )
    const inside =
      target.x >= PADDING &&
      target.x <= size.x - PADDING &&
      target.y >= PADDING + CALLOUT_ROOM &&
      target.y <= size.y - PADDING
    const bounds = latLngBounds(positions)
    const closer =
      positions.length > 1 &&
      Math.min(
        MAX_ZOOM,
        map.getBoundsZoom(
          bounds,
          false,
          point(2 * PADDING, 2 * PADDING + CALLOUT_ROOM),
        ),
      ) -
        map.getZoom() >=
        1
    if (!first && inside && !closer) return
    fittedDay.current = dayKey
    if (positions.length === 1) map.setView(positions[0], 15, { animate })
    else
      map.fitBounds(bounds, {
        paddingTopLeft: point(PADDING, PADDING + CALLOUT_ROOM),
        paddingBottomRight: point(PADDING, PADDING),
        maxZoom: MAX_ZOOM,
        animate,
        duration: 0.5,
      })
  }, [dayKey, focus, followView, map, positions])
  return null
}
