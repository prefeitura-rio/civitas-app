import type { DivIcon, Marker as LeafletMarker } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { Marker, useMap } from 'react-leaflet'

import {
  animate,
  lerp,
  placeCallout,
} from '@/modules/vehicle-intelligence/components/timeline/day/map-motion'

/**
 * O balão da leitura ativa: um só, reaproveitado a cada passo. Desliza da leitura anterior para a nova no mesmo
 * relógio do trecho que se desenha e se ajeita nas bordas do mapa. O react-leaflet só usa a posição ao criar o
 * marcador; daí em diante quem move é o deslizamento.
 */
export function GlidingCallout({
  position,
  icon,
  motionMs,
}: {
  position: [number, number]
  icon: DivIcon
  motionMs: number
}) {
  const map = useMap()
  const markerRef = useRef<LeafletMarker>(null)
  const [initial] = useState(position)
  const [lat, lng] = position

  // O conteúdo mudou (o ícone é outro elemento): recoloca antes da pintura.
  useEffect(() => {
    if (markerRef.current) placeCallout(map, markerRef.current)
  }, [icon, map])

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    const current = marker.getLatLng()
    const from: [number, number] = [current.lat, current.lng]
    if (from[0] === lat && from[1] === lng) {
      placeCallout(map, marker)
      return
    }
    return animate(motionMs, (progress) => {
      marker.setLatLng(lerp(from, [lat, lng], progress))
      placeCallout(map, marker)
    })
  }, [lat, lng, map, motionMs])

  // A câmera mexeu: o balão vira para baixo ou desliza para dentro perto das bordas.
  useEffect(() => {
    const place = () =>
      markerRef.current && placeCallout(map, markerRef.current)
    map.on('move zoomend resize', place)
    return () => {
      map.off('move zoomend resize', place)
    }
  }, [map])

  return (
    <Marker
      ref={markerRef}
      position={initial}
      icon={icon}
      interactive={false}
      zIndexOffset={9000}
    />
  )
}
