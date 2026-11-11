import { latLngBounds } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Enquadra o mapa nos pontos uma vez, ou de novo quando `fitKey` muda (a timeline do grupo enquadra a cada dia). Sem
 * animação: sair da tela no meio de um zoom animado deixa o Leaflet mexendo num mapa já removido. O ajuste se repete
 * em `retryMs`, porque o tamanho do mapa ainda muda enquanto a tela acaba de abrir.
 */
export function FitBounds({
  points,
  fitKey = '',
  padding,
  maxZoom,
  retryMs,
}: {
  points: Array<[number, number]>
  fitKey?: string
  padding: number
  maxZoom: number
  retryMs: number[]
}) {
  const map = useMap()
  const fitted = useRef<string | null>(null)
  useEffect(() => {
    if (!points.length || fitted.current === fitKey) return
    fitted.current = fitKey
    const fit = () => {
      map.invalidateSize()
      map.fitBounds(latLngBounds(points), {
        padding: [padding, padding],
        maxZoom,
        animate: false,
      })
    }
    fit()
    const timers = retryMs.map((delay) => window.setTimeout(fit, delay))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
    // `retryMs` é uma lista literal em cada uso (um array novo a cada render).
    // Dependências incompletas de propósito.
  }, [fitKey, map, points, padding, maxZoom])
  return null
}
