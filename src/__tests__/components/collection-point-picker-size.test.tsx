import { WebMercatorViewport } from '@deck.gl/core'
import { act, renderHook } from '@testing-library/react'
import type { MapRef } from 'react-map-gl'

import { getMapViewport } from '@/components/custom/collection-point-picker/collection-point-picker-utils'
import { useCollectionPointPickerState } from '@/components/custom/collection-point-picker/use-collection-point-picker-state'
import type { CollectionPoint } from '@/models/entities'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('deck.gl', () =>
  jest.requireActual('../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual('../../../node_modules/supercluster/dist/supercluster.js'),
)
jest.mock('@/hooks/useQueries/useCollectionPoints', () => ({
  useCollectionPoints: () => ({ data: mockPoints, isPending: false }),
}))
jest.mock('@/http/mapbox/get-places', () => ({ getPlaces: jest.fn() }))

const viewport = {
  longitude: -43.2,
  latitude: -22.9,
  zoom: 17,
  pitch: 0,
  bearing: 0,
}
const [edgeLongitude, edgeLatitude] = new WebMercatorViewport({
  ...viewport,
  width: 1200,
  height: 600,
}).unproject([1100, 300])
const point: CollectionPoint = {
  cetRioCode: 'CENTER',
  company: 'CIVITAS',
  longitude: viewport.longitude,
  latitude: viewport.latitude,
  location: 'Centro',
  district: 'Centro',
  direction: null,
  lane: null,
  lastDetectionTime: null,
  activeInLast24Hours: true,
}
const points = [
  point,
  {
    ...point,
    cetRioCode: 'EDGE',
    longitude: edgeLongitude,
    latitude: edgeLatitude,
  },
]
let mockPoints = points
const props = { value: [], onChange: jest.fn() }

function visibleIcons(
  picker: ReturnType<typeof useCollectionPointPickerState>,
) {
  return picker.mapLayers.find(
    (layer) => layer?.id === 'collection-point-picker-point-layer',
  )?.props.data
}

describe('collection point picker renderer dimensions', () => {
  beforeEach(() => {
    mockPoints = points
  })
  afterEach(() => jest.useRealTimers())
  it('does not infer visible points from a fallback before the map reports its size', () => {
    const { result } = renderHook(() => useCollectionPointPickerState(props))
    act(() => result.current.handleViewStateChange(viewport))

    expect(result.current.listBuckets.visibleCount).toBe(0)
    expect(visibleIcons(result.current)).toEqual([])
  })

  it('updates both list visibility and the spatial query on resize without moving the camera', () => {
    const { result } = renderHook(() => useCollectionPointPickerState(props))
    act(() => {
      result.current.handleMapResize({ width: 400, height: 600 })
      result.current.handleViewStateChange(viewport)
    })
    expect(result.current.listBuckets.visibleIds.has('EDGE')).toBe(false)
    expect(visibleIcons(result.current)).toEqual([point])
    const before = result.current.viewState

    act(() => result.current.handleMapResize({ width: 1200, height: 600 }))

    expect(result.current.listBuckets.visibleIds.has('EDGE')).toBe(true)
    expect(visibleIcons(result.current)).toEqual(expect.arrayContaining(points))
    expect(result.current.viewState).toBe(before)
  })

  it('waits for positive dimensions before the opening fit and uses fresh dimensions after reopening', () => {
    mockPoints = [
      point,
      { ...point, cetRioCode: 'FAR', longitude: -43.5, latitude: -23.1 },
    ]
    const { result } = renderHook(() => useCollectionPointPickerState(props))
    const initial = result.current.viewState
    act(() => result.current.openPicker())
    expect(result.current.viewState).toEqual(initial)
    act(() => result.current.handleMapResize({ width: 0, height: 0 }))
    expect(result.current.viewState).toEqual(initial)

    act(() => result.current.handleMapResize({ width: 900, height: 520 }))
    const firstFit = getMapViewport(mockPoints, 900, 520)
    expect(result.current.viewState).toEqual(firstFit)
    act(() => result.current.handleMapResize({ width: 750, height: 480 }))
    expect(result.current.viewState).toEqual(firstFit)
    act(() => result.current.handleMapResize({ width: 0, height: 0 }))
    expect(result.current.listBuckets.visibleCount).toBe(0)
    expect(visibleIcons(result.current)).toEqual([])

    act(() => result.current.closePicker())
    act(() => result.current.openPicker())
    expect(result.current.listBuckets.visibleCount).toBe(0)
    act(() => result.current.handleMapResize({ width: 420, height: 360 }))
    const secondFit = getMapViewport(mockPoints, 420, 360)
    expect(result.current.viewState).toEqual(secondFit)
    expect(secondFit.zoom).not.toBe(firstFit.zoom)
  })

  it('resizes Mapbox on load and subsequent dimensions without a fixed timer', () => {
    jest.useFakeTimers()
    const resize = jest.fn()
    const { result, unmount } = renderHook(() =>
      useCollectionPointPickerState(props),
    )
    result.current.mapRef.current = { resize } as unknown as MapRef
    act(() => result.current.handleMapLoad())
    expect(resize).toHaveBeenCalledTimes(1)
    act(() => result.current.handleMapResize({ width: 900, height: 520 }))
    expect(resize).toHaveBeenCalledTimes(2)
    expect(jest.getTimerCount()).toBe(0)
    unmount()
    expect(jest.getTimerCount()).toBe(0)
    jest.useRealTimers()
  })
})
