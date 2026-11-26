import { renderHook } from '@testing-library/react'
import type { Deck } from 'deck.gl'
import type { MouseEvent } from 'react'

import { useMouseInteractions } from '@/hooks/maps/use-mouse-interactions'

// Mapa deslocado: barra lateral de 56px e, em dev/staging, a barra de personificação (44px) no topo.
const MAP_RECT = { left: 56, top: 44 }

function clickAt(clientX: number, clientY: number) {
  return {
    clientX,
    clientY,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    currentTarget: {
      getBoundingClientRect: () => ({ ...MAP_RECT, width: 800, height: 600 }),
    },
  } as unknown as MouseEvent
}

function renderInteractions() {
  const pickObject = jest.fn().mockReturnValue(null)
  const deckRef = { current: { pickObject } as unknown as Deck }
  const { result } = renderHook(() =>
    useMouseInteractions({
      deckRef,
      multiSelectRadar: jest.fn(),
      selectCamera: jest.fn(),
      setSelectedRadar: jest.fn(),
      setSelectedCamera: jest.fn(),
      setContextMenuPickingInfo: jest.fn(),
      setOpenContextMenu: jest.fn(),
      zoomToLocation: jest.fn(),
    }),
  )
  return { result, pickObject }
}

describe('useMouseInteractions', () => {
  it('clique esquerdo procura o ponto relativo ao mapa', () => {
    const { result, pickObject } = renderInteractions()

    result.current.handleLeftClick(clickAt(300, 200))

    expect(pickObject).toHaveBeenCalledWith({ x: 244, y: 156, radius: 0 })
  })

  it('clique direito procura o ponto relativo ao mapa', () => {
    const { result, pickObject } = renderInteractions()

    result.current.handleRightClick(clickAt(300, 200))

    expect(pickObject).toHaveBeenCalledWith({ x: 244, y: 156, radius: 0 })
  })
})
