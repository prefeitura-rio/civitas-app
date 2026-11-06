import { renderHook } from '@testing-library/react'

import { useMapLayers } from '@/hooks/maps/use-map-layers'
import type { CollectionPoint } from '@/models/entities'
import { POINT_LAYER_IDS } from '@/utils/point-layer-config'
import {
  createCameraSources,
  createCollectionPointSources,
} from '@/utils/point-layer-sources'

jest.mock('@/hooks/useContexts/use-map-context', () => ({
  useMap: () => mockContext,
}))
jest.mock('@/utils/point-layer-sources', () => {
  const actual = jest.requireActual('@/utils/point-layer-sources')
  return {
    ...actual,
    createCameraSources: jest.fn(actual.createCameraSources),
    createCollectionPointSources: jest.fn(actual.createCollectionPointSources),
  }
})

const point: CollectionPoint = {
  cetRioCode: 'A',
  company: 'CIVITAS',
  longitude: -43.2,
  latitude: -22.9,
  location: null,
  district: null,
  direction: null,
  lane: null,
  lastDetectionTime: null,
  activeInLast24Hours: true,
}

function makeContext() {
  const radarData = [point]
  return {
    layers: {
      radars: {
        data: radarData,
        visibleData: radarData,
        isVisible: true,
        layer: { id: POINT_LAYER_IDS.radars },
      },
      cameras: {
        data: [],
        visibleData: [],
        isVisible: false,
        layer: { id: POINT_LAYER_IDS.cameras },
      },
      fogoCruzado: {
        data: [],
        isVisible: false,
        layer: { id: POINT_LAYER_IDS.incidents },
      },
      schools: { data: [], isVisible: false, layers: [] },
      busStops: { data: [], isVisible: false, layers: [] },
      trips: { layers: [] },
      AISP: { layers: [] },
      CISP: { layers: [] },
      address: { layer: {}, layerStates: {} },
    },
  }
}
let mockContext = makeContext()

describe('useMapLayers spatial source preparation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockContext = makeContext()
  })

  it('keeps prepared sources stable when only rendered layer instances change', () => {
    const { result, rerender } = renderHook(() => useMapLayers())
    const sources = result.current.pointSources
    mockContext.layers.radars.layer = { id: POINT_LAYER_IDS.radars }
    rerender()

    expect(result.current.pointSources).toBe(sources)
  })

  it('updates visibility without adapting source points again', () => {
    const { result, rerender } = renderHook(() => useMapLayers())
    const sources = result.current.pointSources
    mockContext.layers.radars.isVisible = false
    rerender()

    expect(result.current.pointSources).not.toBe(sources)
    result.current.pointSources.forEach((source, index) => {
      expect(source.points).toBe(sources[index].points)
      expect(source.visible).toBe(false)
    })
  })

  it('adapts changed domain data while retaining every unrelated source', () => {
    const { result, rerender } = renderHook(() => useMapLayers())
    const previous = result.current.pointSources
    mockContext.layers.radars.visibleData = [{ ...point, cetRioCode: 'B' }]
    rerender()

    expect(result.current.pointSources[0].points[0].id).toBe('radars:B')
    expect(result.current.pointSources[0].points[0].point).toBe(
      mockContext.layers.radars.visibleData[0],
    )
    result.current.pointSources.slice(1).forEach((source, index) => {
      expect(source.points).toBe(previous[index + 1].points)
    })
  })

  it('defers domain adaptation while hidden and reuses preparation after reopening', () => {
    const { rerender } = renderHook(() => useMapLayers())
    expect(createCameraSources).not.toHaveBeenCalled()
    expect(createCollectionPointSources).toHaveBeenCalledTimes(1)

    mockContext.layers.radars.isVisible = false
    rerender()
    mockContext.layers.radars.isVisible = true
    rerender()
    expect(createCollectionPointSources).toHaveBeenCalledTimes(1)

    mockContext.layers.radars.isVisible = false
    mockContext.layers.radars.visibleData = [
      { ...point, cetRioCode: 'UPDATED-WHILE-HIDDEN' },
    ]
    rerender()
    expect(createCollectionPointSources).toHaveBeenCalledTimes(1)
    mockContext.layers.radars.isVisible = true
    rerender()
    expect(createCollectionPointSources).toHaveBeenCalledTimes(2)
  })
})
