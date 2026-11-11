/**
 * O movimento do mapa do dia entre um passo e outro (como na linha do tempo do chatbot CIVITAS): o trecho novo se
 * desenha até a leitura, o balão desliza junto no mesmo relógio, o marcador pousa e o fato pulsa. Parado, o mapa é o
 * mesmo de sempre: o movimento só existe entre os passos.
 */
import type { Map as LeafletMap, Marker } from 'leaflet'

/** Desacelera no fim (a mesma curva do chatbot). */
export const easeOut = (p: number) => 1 - (1 - p) ** 3

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Quanto dura o movimento de um passo: tocando, 80% do intervalo (até 0,7 s); passo a passo, 0,42 s; ao arrastar o
 * trilho ou com "reduzir movimento", nada. */
export function stepMotionMs({
  playing,
  speed,
  scrubbing,
}: {
  playing: boolean
  speed: number
  scrubbing: boolean
}) {
  if (scrubbing || prefersReducedMotion()) return 0
  return playing ? Math.min(Math.round(speed * 0.8), 700) : 420
}

/** Chama `frame` a cada quadro com o progresso (0 → 1, já com a curva) e para no fim; devolve o cancelamento. */
export function animate(
  duration: number,
  frame: (progress: number) => void,
): () => void {
  if (duration <= 0) {
    frame(1)
    return () => {}
  }
  const start = performance.now()
  let id = 0
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration)
    frame(easeOut(progress))
    if (progress < 1) id = requestAnimationFrame(tick)
  }
  id = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(id)
}

export const lerp = (
  from: [number, number],
  to: [number, number],
  p: number,
): [number, number] => [
  from[0] + (to[0] - from[0]) * p,
  from[1] + (to[1] - from[1]) * p,
]

/** Distância do balão ao marcador (px), a mesma do CSS (`.analysis-map-callout`). */
const GAP = 25
const EDGE = 8

/** Põe o balão acima do marcador; se fosse sair pelo topo do mapa, embaixo; perto das laterais, desliza para dentro
 * (o rabicho continua apontando o marcador). */
export function placeCallout(map: LeafletMap, marker: Marker) {
  const callout = marker.getElement()?.firstElementChild as HTMLElement | null
  if (!callout) return
  const { offsetWidth: width, offsetHeight: height } = callout
  if (!width || !height) return
  const point = map.latLngToContainerPoint(marker.getLatLng())
  const size = map.getSize()
  const below =
    point.y - GAP - height < EDGE &&
    size.y - point.y - GAP - height > point.y - GAP - height
  let dx = 0
  if (point.x - width / 2 < EDGE) dx = EDGE - (point.x - width / 2)
  else if (point.x + width / 2 > size.x - EDGE)
    dx = size.x - EDGE - (point.x + width / 2)
  dx = Math.max(-(width / 2 - 18), Math.min(width / 2 - 18, dx))
  callout.style.setProperty('--callout-x', `${Math.round(dx)}px`)
  callout.classList.toggle('below', below)
}
