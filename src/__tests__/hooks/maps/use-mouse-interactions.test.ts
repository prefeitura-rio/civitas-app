import { renderHook } from '@testing-library/react'
import type { Deck, PickingInfo } from 'deck.gl'
import type { MouseEvent } from 'react'

import { useMouseInteractions } from '@/hooks/maps/use-mouse-interactions'
import type { CollectionPoint } from '@/models/entities'
import { POINT_LAYER_IDS } from '@/utils/point-layer-config'

const MAP_RECT = { left: 120, top: 80 }

function mouseAt(clientX: number, clientY: number) {
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

const radar = {
  cetRioCode: 'LPR-1',
  latitude: 0,
  longitude: 0,
} as CollectionPoint

function picked(layerId: string, object: unknown): PickingInfo {
  return { layer: { id: layerId }, object } as unknown as PickingInfo
}

function renderInteractions(pickResult: PickingInfo | null = null) {
  const pickObject = jest.fn().mockReturnValue(pickResult)
  const multiSelectRadar = jest.fn()
  const deckRef = { current: { pickObject } as unknown as Deck }
  const { result } = renderHook(() =>
    useMouseInteractions({
      deckRef,
      multiSelectRadar,
      selectCamera: jest.fn(),
      setSelectedRadar: jest.fn(),
      setSelectedCamera: jest.fn(),
      setContextMenuPickingInfo: jest.fn(),
      setOpenContextMenu: jest.fn(),
      zoomToLocation: jest.fn(),
    }),
  )
  return { result, pickObject, multiSelectRadar }
}

describe('useMouseInteractions', () => {
  it('clique esquerdo procura o ponto relativo ao mapa', () => {
    const { result, pickObject } = renderInteractions()

    result.current.handleLeftClick(mouseAt(300, 200))

    expect(pickObject).toHaveBeenCalledWith({ x: 180, y: 120, radius: 0 })
  })

  it('clique direito procura o ponto relativo ao mapa', () => {
    const { result, pickObject } = renderInteractions()

    result.current.handleRightClick(mouseAt(300, 200))

    expect(pickObject).toHaveBeenCalledWith({ x: 180, y: 120, radius: 0 })
  })

  it('clique esquerdo num LPR seleciona o equipamento', () => {
    const { result, multiSelectRadar } = renderInteractions(
      picked(POINT_LAYER_IDS.radars, radar),
    )

    result.current.handleLeftClick(mouseAt(300, 200))

    expect(multiSelectRadar).toHaveBeenCalledWith(radar)
  })

  it.each([
    ['outra camada', picked(POINT_LAYER_IDS.cameras, radar)],
    ['nenhum objeto', picked(POINT_LAYER_IDS.radars, null)],
    ['área vazia', null],
  ])('clique esquerdo em %s não seleciona LPR', (_, pickResult) => {
    const { result, multiSelectRadar } = renderInteractions(pickResult)

    result.current.handleLeftClick(mouseAt(300, 200))

    expect(multiSelectRadar).not.toHaveBeenCalled()
  })

  it('soltar depois de arrastar o mapa não seleciona, e o clique seguinte volta a selecionar', () => {
    const { result, pickObject, multiSelectRadar } = renderInteractions(
      picked(POINT_LAYER_IDS.radars, radar),
    )

    result.current.handleMouseDown(mouseAt(100, 100))
    result.current.handleMouseMove(mouseAt(111, 100))
    result.current.handleLeftClick(mouseAt(111, 100))

    expect(pickObject).not.toHaveBeenCalled()
    expect(multiSelectRadar).not.toHaveBeenCalled()

    result.current.handleLeftClick(mouseAt(111, 100))

    expect(multiSelectRadar).toHaveBeenCalledWith(radar)
  })

  it('um movimento de até 10px ainda conta como clique', () => {
    const { result, multiSelectRadar } = renderInteractions(
      picked(POINT_LAYER_IDS.radars, radar),
    )

    result.current.handleMouseDown(mouseAt(100, 100))
    result.current.handleMouseMove(mouseAt(110, 100))
    result.current.handleLeftClick(mouseAt(110, 100))

    expect(multiSelectRadar).toHaveBeenCalledWith(radar)
  })
})
