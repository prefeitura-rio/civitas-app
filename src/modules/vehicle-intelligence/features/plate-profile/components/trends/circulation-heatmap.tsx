import 'leaflet.heat'

import { heatLayer } from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'

import type { CirclePoint } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'

export function CirculationHeatmap({
  points,
  visible,
}: {
  points: CirclePoint[]
  visible: boolean
}) {
  const map = useMap()
  const maximum = Math.max(1, ...points.map((point) => point.detections))
  // Passamos a contagem crua: normalizar é papel da opção `max`, que o
  // leaflet.heat aplica em `globalAlpha = valor / this._max`. Dividir aqui
  // seria fazer a mesma conta duas vezes.
  const weightedPoints = useMemo(
    () =>
      points
        .filter(
          (point) =>
            Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
        )
        .map(
          (point) =>
            [point.latitude, point.longitude, point.detections] as [
              number,
              number,
              number,
            ],
        ),
    [points],
  )
  const layerRef = useRef<ReturnType<typeof heatLayer> | null>(null)
  useEffect(() => {
    if (!weightedPoints.length) return
    const layer = heatLayer(weightedPoints, {
      // `maxZoom` no leaflet.heat NÃO é o zoom máximo da camada: é o zoom em que
      // a intensidade vale 100%. Abaixo dele o peso é dividido por 2 a cada
      // nível (`f = 1/2^(maxZoom - zoom)`). Com 17, no zoom 11 de abertura o
      // fator era 1/64 — toda intensidade caía abaixo do minOpacity e o
      // `Math.max(valor, minOpacity)` devolvia o piso para TODOS os pontos,
      // desenhando o ponto de 113 detecções igual ao de 1. Zerar desliga essa
      // atenuação, já que `Math.max(0, maxZoom - zoom)` fica em 0.
      maxZoom: 0,
      // Piso baixo: `globalAlpha = Math.max(valor, minOpacity)`, então um piso
      // alto igualaria todos os pontos fracos entre si.
      minOpacity: 0.05,
      // Normalização nativa: o ponto mais movimentado da placa vale 1,0 e os
      // demais ficam proporcionais ao seu número de registros.
      max: maximum,
      radius: 35,
      blur: 20,
      gradient: {
        0.05: '#2563eb',
        0.3: '#20d6ff',
        0.65: '#facc15',
        1: '#ef4444',
      },
    })
    layerRef.current = layer
    if (visible) layer.addTo(map)
    return () => {
      if (map.hasLayer(layer)) map.removeLayer(layer)
      layerRef.current = null
    }
    // A camada é recriada só quando os pontos mudam; o efeito seguinte liga e desliga pela `visible`.
    // Dependências incompletas de propósito.
  }, [map, maximum, weightedPoints])
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    if (visible && !map.hasLayer(layer)) layer.addTo(map)
    if (!visible && map.hasLayer(layer)) map.removeLayer(layer)
  }, [map, visible])
  return null
}
