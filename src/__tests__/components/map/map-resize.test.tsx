import type { DeckProps } from '@deck.gl/core'
import { act, render, screen } from '@testing-library/react'

import { Map } from '@/app/(app)/veiculos/components/map'
import { SearchBox } from '@/app/(app)/veiculos/components/map/components/search-box'
import { useClusteredMapLayers } from '@/hooks/maps/use-clustered-map-layers'

let mockDeckProps: DeckProps
const mockMapboxResize = jest.fn()
jest.mock('deck.gl', () => {
  const React = jest.requireActual('react')
  return {
    DeckGL: React.forwardRef(({ children, ...props }: any, ref: unknown) => {
      React.useImperativeHandle(ref, () => ({}))
      mockDeckProps = props
      return <div>{children}</div>
    }),
  }
})
jest.mock('react-map-gl', () => {
  const React = jest.requireActual('react')
  return {
    __esModule: true,
    default: React.forwardRef((_props: unknown, ref: unknown) => {
      React.useImperativeHandle(ref, () => ({ resize: mockMapboxResize }))
      return <div />
    }),
  }
})
jest.mock('@/hooks/maps/use-clustered-map-layers', () => ({
  useClusteredMapLayers: jest.fn(() => ({
    layers: [],
    hoveredCluster: null,
    hoveredOriginCounts: {},
    clearHoveredCluster: jest.fn(),
  })),
}))
jest.mock('@/hooks/maps/use-map-state', () => ({
  useMapState: () => ({
    viewport: { longitude: -43.2, latitude: -22.9, zoom: 12 },
    setViewport: jest.fn(),
  }),
}))
jest.mock('@/hooks/maps/use-map-layers', () => ({
  useMapLayers: () => ({ mapLayers: [], pointSources: [] }),
}))
jest.mock('@/hooks/maps/use-map-search', () => ({ useMapSearch: () => ({}) }))
jest.mock('@/hooks/maps/use-mouse-interactions', () => ({
  useMouseInteractions: () => ({}),
}))
jest.mock('@/hooks/maps/use-selection-management', () => ({
  useSelectionManagement: jest.fn(),
}))
jest.mock('@/hooks/useContexts/use-map-context', () => ({ useMap: () => ({}) }))
jest.mock(
  '@/app/(app)/veiculos/components/map/components/select-cards',
  () => ({
    SelectionCards: ({ mapWidth }: { mapWidth?: number }) => (
      <div data-testid="selection-width">{mapWidth ?? 'unmeasured'}</div>
    ),
  }),
)
jest.mock(
  '@/app/(app)/veiculos/components/map/components/context-menu',
  () => ({ ContextMenu: () => null }),
)
jest.mock('@/app/(app)/veiculos/components/map/components/hover-cards', () => ({
  HoverCards: () => null,
}))
jest.mock(
  '@/app/(app)/veiculos/components/map/components/layer-toggle',
  () => ({ MapLayerControl: () => null }),
)
jest.mock('@/app/(app)/veiculos/components/map/components/search-box', () => ({
  SearchBox: jest.fn(() => null),
}))

describe('vehicle map renderer resize wiring', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders and clears the red circle selected by the equipment search', () => {
    render(<Map />)
    act(() =>
      jest.mocked(SearchBox).mock.lastCall?.[0].setEquipmentHighlight?.({
        longitude: -43.2,
        latitude: -22.9,
      }),
    )
    expect((mockDeckProps.layers as { id: string }[]).at(-1)?.id).toBe(
      'search-equipment-highlight',
    )
    expect(jest.mocked(SearchBox).mock.lastCall?.[0].isVisible).toBe(true)
    act(() =>
      jest.mocked(SearchBox).mock.lastCall?.[0].setEquipmentHighlight?.(null),
    )
    expect((mockDeckProps.layers as unknown[]).at(-1)).toBeNull()
  })

  it('shares the renderer size with clustering and cards while synchronizing Mapbox', () => {
    render(<Map />)
    expect(jest.mocked(useClusteredMapLayers).mock.lastCall?.[3]).toBeNull()
    expect(screen.getByTestId('selection-width')).toHaveTextContent(
      'unmeasured',
    )

    act(() => mockDeckProps.onResize?.({ width: 1200, height: 600 }))

    expect(jest.mocked(useClusteredMapLayers).mock.lastCall?.[3]).toEqual({
      width: 1200,
      height: 600,
    })
    expect(screen.getByTestId('selection-width')).toHaveTextContent('1200')
    expect(mockMapboxResize).toHaveBeenCalledTimes(1)

    act(() => mockDeckProps.onResize?.({ width: 700, height: 420 }))
    expect(jest.mocked(useClusteredMapLayers).mock.lastCall?.[3]).toEqual({
      width: 700,
      height: 420,
    })
    expect(screen.getByTestId('selection-width')).toHaveTextContent('700')
    expect(mockMapboxResize).toHaveBeenCalledTimes(2)
  })
})
