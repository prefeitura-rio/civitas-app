import type { CircleMarker, LeafletKeyboardEvent } from 'leaflet'

import {
  accessibleMarker,
  markerScale,
} from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'

describe('markerScale', () => {
  it('é a raiz da fração do máximo (a área do círculo acompanha a contagem)', () => {
    expect(markerScale(25, 100)).toBe(0.5)
    expect(markerScale(100, 100)).toBe(1)
    expect(markerScale(0, 100)).toBe(0)
  })

  it('máximo zero conta como 1', () => {
    expect(markerScale(1, 0)).toBe(1)
  })
})

describe('accessibleMarker', () => {
  const key = (value: string, target: unknown) => {
    const preventDefault = jest.fn()
    return {
      event: {
        originalEvent: { key: value, preventDefault },
        target,
      } as unknown as LeafletKeyboardEvent,
      preventDefault,
    }
  }

  it('dá foco, papel de botão e rótulo ao elemento do marcador', () => {
    const element = document.createElement('div')
    const handlers = accessibleMarker('Polo X, 3 ocorrências', () => undefined)
    handlers.add({ target: { getElement: () => element } })
    expect(element.getAttribute('tabindex')).toBe('0')
    expect(element.getAttribute('role')).toBe('button')
    expect(element.getAttribute('aria-label')).toBe('Polo X, 3 ocorrências')
  })

  it('Enter e espaço ativam o marcador; outras teclas não', () => {
    const marker = {} as CircleMarker
    const onActivate = jest.fn()
    const handlers = accessibleMarker('Polo', onActivate)
    const enter = key('Enter', marker)
    handlers.keydown(enter.event)
    expect(onActivate).toHaveBeenCalledWith(marker)
    expect(enter.preventDefault).toHaveBeenCalled()
    handlers.keydown(key(' ', marker).event)
    expect(onActivate).toHaveBeenCalledTimes(2)
    const tab = key('Tab', marker)
    handlers.keydown(tab.event)
    expect(onActivate).toHaveBeenCalledTimes(2)
    expect(tab.preventDefault).not.toHaveBeenCalled()
  })
})
