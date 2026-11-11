import type {
  CircleMarker as LeafletCircleMarker,
  LeafletKeyboardEvent,
} from 'leaflet'

/** Raio e espessura dos polos: a área do círculo cresce com a contagem (raiz da fração do máximo). */
export function markerScale(value: number, maximum: number): number {
  return Math.sqrt(value / Math.max(maximum, 1))
}

/** O sistema pede menos movimento: sem zoom animado nem abrir/fechar gradual dos polos. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Marcadores circulares também respondem a teclado: foco, papel de botão e Enter/espaço. */
export function accessibleMarker(
  label: string,
  onActivate: (marker: LeafletCircleMarker) => void,
) {
  return {
    add: (event: { target: unknown }) => {
      const element = (event.target as LeafletCircleMarker).getElement()
      element?.setAttribute('tabindex', '0')
      element?.setAttribute('role', 'button')
      element?.setAttribute('aria-label', label)
    },
    keydown: (event: LeafletKeyboardEvent) => {
      if (
        event.originalEvent.key !== 'Enter' &&
        event.originalEvent.key !== ' '
      )
        return
      event.originalEvent.preventDefault()
      onActivate(event.target as LeafletCircleMarker)
    },
  }
}
