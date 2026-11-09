import type { GeoJsonLayer } from '@deck.gl/layers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useAISPLayer } from '@/hooks/mapLayers/use-AISP-layer'
import { useCISPLayer } from '@/hooks/mapLayers/use-CISP-layer'
import { getAispColor } from '@/utils/territory-colors'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)

const expected: Array<[number, [number, number, number, number]]> = [
  [27, [173, 216, 230, 200]],
  [40, [152, 251, 152, 200]],
  [31, [255, 250, 150, 200]],
  [14, [255, 165, 90, 200]],
  [18, [230, 230, 250, 200]],
  [41, [255, 209, 220, 200]],
  [9, [211, 211, 211, 200]],
  [3, [240, 230, 190, 200]],
  [6, [64, 224, 208, 200]],
  [16, [255, 200, 150, 200]],
  [17, [95, 158, 160, 200]],
  [22, [144, 238, 144, 200]],
  [4, [216, 191, 216, 200]],
  [5, [255, 215, 100, 200]],
  [2, [240, 128, 128, 200]],
  [19, [175, 238, 238, 200]],
  [23, [255, 240, 210, 200]],
  [1, [176, 196, 222, 200]],
  [7, [150, 190, 210, 200]],
  [999, [47, 47, 47, 200]],
]

it('keeps the same colors in both territory layers, including the fallback', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result, unmount } = renderHook(
    () => [useAISPLayer(), useCISPLayer()],
    { wrapper },
  )
  for (const [id, color] of expected) {
    expect(getAispColor(id)).toEqual(color)
    for (const layerState of result.current) {
      const layer = layerState.layers[0] as GeoJsonLayer
      const getFillColor = layer.props.getFillColor as (feature: {
        properties: { aisp: number }
      }) => unknown
      expect(getFillColor({ properties: { aisp: id } })).toEqual(color)
    }
  }
  unmount()
  client.clear()
})
