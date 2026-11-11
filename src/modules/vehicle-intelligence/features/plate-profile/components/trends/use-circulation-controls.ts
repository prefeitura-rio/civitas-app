/**
 * O estado da seção "Onde circula": a visualização (pontos, viagens, bairros), a camada do mapa, os fatos sobrepostos e
 * o radar a abrir no mapa. Fica no perfil, e não na seção, para sobreviver à troca de aba e de placa como antes.
 */
import { useRef, useState } from 'react'

import type {
  CirculationLayer,
  RadarMapHandle,
  RadarOpenRequest,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'

export function useCirculationControls() {
  const [circulationView, setCirculationView] = useState<
    'points' | 'trips' | 'neighborhoods'
  >('points')
  const [circulationLayer, setCirculationLayer] =
    useState<CirculationLayer>('detections')
  const [showOccurrences, setShowOccurrences] = useState(true)
  const radarMapRef = useRef<RadarMapHandle | null>(null)
  const radarOpenSequence = useRef(0)
  const [radarOpenRequest, setRadarOpenRequest] =
    useState<RadarOpenRequest | null>(null)
  return {
    circulationView,
    setCirculationView,
    circulationLayer,
    setCirculationLayer,
    showOccurrences,
    setShowOccurrences,
    radarMapRef,
    radarOpenSequence,
    radarOpenRequest,
    setRadarOpenRequest,
  }
}

export type CirculationControls = ReturnType<typeof useCirculationControls>
