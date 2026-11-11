import { circleMarker, type Polyline as LeafletPolyline } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { Polyline, Popup, useMap } from 'react-leaflet'

import {
  animate,
  lerp,
} from '@/modules/vehicle-intelligence/components/timeline/day/map-motion'
import { TransitionPopup } from '@/modules/vehicle-intelligence/components/timeline/day/transition-popup'
import { detectionPoint } from '@/modules/vehicle-intelligence/components/timeline/geo'
import type {
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { formatTimeSeconds } from '@/modules/vehicle-intelligence/lib/dates'

/** A linha reta entre duas leituras da trilha, com uma faixa larga invisível para o clique e o teclado. Com `growMs`
 * (o trecho que chega à leitura ativa), a linha se desenha da leitura anterior até ela, com um ponto na frente. */
export function TransitionSegment({
  from,
  to,
  order,
  track,
  growMs = 0,
}: {
  from: TimelineDetection
  to: TimelineDetection
  order: number
  track: TimelineTrack
  growMs?: number
}) {
  const map = useMap()
  const lineRef = useRef<LeafletPolyline>(null)
  const hitboxRef = useRef<LeafletPolyline>(null)
  const positions = [detectionPoint(from), detectionPoint(to)]
  const [[startLat, startLng], [endLat, endLng]] = positions
  // Só na criação: depois, quem desenha é o crescimento (e o react-leaflet não volta a linha ao começo).
  const [grow] = useState(growMs)
  const [linePositions] = useState(() =>
    grow > 0 ? [positions[0], positions[0]] : positions,
  )
  useEffect(() => {
    const line = lineRef.current
    if (!grow || !line) return
    const a: [number, number] = [startLat, startLng]
    const b: [number, number] = [endLat, endLng]
    const head = circleMarker(a, {
      radius: 5.5,
      color: '#fff',
      weight: 2,
      fillColor: track.color,
      fillOpacity: 1,
      interactive: false,
    }).addTo(map)
    const cancel = animate(grow, (progress) => {
      const tip = lerp(a, b, progress)
      line.setLatLngs([a, tip])
      head.setLatLng(tip)
      if (progress >= 1) head.remove()
    })
    return () => {
      cancel()
      head.remove()
      line.setLatLngs([a, b])
    }
  }, [endLat, endLng, grow, map, startLat, startLng, track.color])
  useEffect(() => {
    const layer = hitboxRef.current
    const element = layer?.getElement()
    if (!layer || !element) return
    element.classList.add('timeline-transition-hitbox')
    element.setAttribute('tabindex', '0')
    element.setAttribute('focusable', 'true')
    element.setAttribute('role', 'button')
    element.setAttribute('aria-haspopup', 'dialog')
    element.setAttribute(
      'aria-label',
      `${track.label} ${track.plate}, trecho ${order} para ${order + 1}, de ${from.location || 'local não informado'} às ${formatTimeSeconds(from.detected_at)} para ${to.location || 'local não informado'} às ${formatTimeSeconds(to.detected_at)}`,
    )
    const openWithKeyboard = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent
      if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return
      keyboardEvent.preventDefault()
      layer.openPopup()
    }
    element.addEventListener('keydown', openWithKeyboard)
    return () => element.removeEventListener('keydown', openWithKeyboard)
  }, [from, order, to, track.label, track.plate])
  return (
    <>
      <Polyline
        ref={lineRef}
        positions={linePositions}
        interactive={false}
        pathOptions={{
          color: track.color,
          weight: 3.5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      <Polyline
        ref={hitboxRef}
        positions={positions}
        pathOptions={{
          color: track.color,
          weight: 28,
          opacity: 0,
          lineCap: 'round',
          lineJoin: 'round',
        }}
        eventHandlers={{
          mouseover: (event) => event.target.setStyle({ opacity: 0.12 }),
          mouseout: (event) => event.target.setStyle({ opacity: 0 }),
        }}
      >
        <Popup className="civitas-popup transition-popup" maxWidth={380}>
          <TransitionPopup from={from} to={to} order={order} track={track} />
        </Popup>
      </Polyline>
    </>
  )
}
