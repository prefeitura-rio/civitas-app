import { WebMercatorViewport } from '@deck.gl/core'
import { act, renderHook } from '@testing-library/react'

import { useCollectionPointPickerState } from '@/components/custom/collection-point-picker/use-collection-point-picker-state'
import type { CollectionPoint } from '@/models/entities'
import type { ClusterFeature } from '@/utils/point-clustering'

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
  useCollectionPoints: () => ({ data: points, isPending: false }),
}))
jest.mock('@/http/mapbox/get-places', () => ({ getPlaces: jest.fn() }))

const size = { width: 900, height: 520 }
const viewport = { longitude: -43.2, latitude: -22.9, zoom: 12 }
const [marginLongitude, marginLatitude] = new WebMercatorViewport({
  ...viewport,
  ...size,
}).unproject([size.width + 32, size.height / 2])
const visiblePoints: CollectionPoint[] = Array.from(
  { length: 4 },
  (_, index) => ({
    cetRioCode: `VISIBLE-${index + 1}`,
    company: 'CIVITAS',
    longitude: viewport.longitude,
    latitude: viewport.latitude,
    location: index < 2 ? 'MATCH' : 'OTHER',
    district: 'Centro',
    direction: null,
    lane: null,
    lastDetectionTime: null,
    activeInLast24Hours: true,
  }),
)
const points = [
  ...visiblePoints,
  {
    ...visiblePoints[0],
    cetRioCode: 'MARGIN',
    longitude: marginLongitude,
    latitude: marginLatitude,
  },
  { ...visiblePoints[0], cetRioCode: 'OUTSIDE', longitude: -44, latitude: -24 },
]
const onChange = jest.fn()
const props = { value: ['OUTSIDE', 'VISIBLE-1'], onChange }

function measuredPicker() {
  const hook = renderHook(() => useCollectionPointPickerState(props))
  act(() => {
    hook.result.current.handleMapResize(size)
    hook.result.current.handleViewStateChange(viewport)
  })
  return hook
}

describe('visible collection point selection', () => {
  beforeEach(() => jest.clearAllMocks())

  it('adds all visible cluster members, preserving previous selections and excluding the offscreen query margin', () => {
    const { result } = measuredPicker()
    const circles = result.current.mapLayers.find((layer) =>
      layer?.id.endsWith('-clusters-circles'),
    )
    if (!circles) throw new Error('Missing cluster layer')
    expect(
      Array.from(circles.props.data as Iterable<ClusterFeature>)[0].properties
        .point_count,
    ).toBe(4)
    expect(result.current.visibleCollectionPointIds).toEqual(
      visiblePoints.map((point) => point.cetRioCode),
    )

    act(() => result.current.selectVisibleCollectionPointIds())

    expect(result.current.draftValue).toEqual([
      'OUTSIDE',
      'VISIBLE-1',
      'VISIBLE-2',
      'VISIBLE-3',
      'VISIBLE-4',
    ])
    expect(onChange).not.toHaveBeenCalled()
    expect(result.current.draftValue).not.toContain('MARGIN')
  })

  it('does not duplicate IDs or emit another selection when clicked again', () => {
    const { result } = measuredPicker()
    act(() => result.current.selectVisibleCollectionPointIds())
    act(() => result.current.selectVisibleCollectionPointIds())

    expect(result.current.draftValue).toHaveLength(5)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('preserves the selection when panning and zooming to a different visible set', () => {
    const { result } = measuredPicker()
    act(() => result.current.selectVisibleCollectionPointIds())
    const selected = result.current.draftValue

    act(() =>
      result.current.handleViewStateChange({
        longitude: -44,
        latitude: -24,
        zoom: 12,
      }),
    )
    expect(result.current.visibleCollectionPointIds).toEqual(['OUTSIDE'])
    expect(result.current.draftValue).toBe(selected)
    act(() => result.current.handleViewStateChange({ ...viewport, zoom: 17 }))
    expect(result.current.draftValue).toBe(selected)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does nothing before measurement or when there are no eligible visible points', () => {
    const { result } = renderHook(() => useCollectionPointPickerState(props))
    expect(result.current.visibleCollectionPointIds).toEqual([])
    act(() => result.current.selectVisibleCollectionPointIds())
    act(() => {
      result.current.handleMapResize(size)
      result.current.handleViewStateChange({
        longitude: 0,
        latitude: 0,
        zoom: 12,
      })
    })
    act(() => result.current.selectVisibleCollectionPointIds())

    expect(result.current.draftValue).toEqual(props.value)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('respects the text search without adding matching points outside the map', () => {
    const { result } = measuredPicker()
    act(() => result.current.handleSearchChange('MATCH'))
    expect(result.current.visibleCollectionPointIds).toEqual([
      'VISIBLE-1',
      'VISIBLE-2',
    ])
    act(() => result.current.selectVisibleCollectionPointIds())

    expect(result.current.draftValue).toEqual([
      'OUTSIDE',
      'VISIBLE-1',
      'VISIBLE-2',
    ])
  })

  it('discards changes on close and applies them only on confirmation', () => {
    const { result } = measuredPicker()
    act(() => result.current.openPicker())
    act(() => result.current.togglePointFromMapOrList(visiblePoints[1]))
    expect(onChange).not.toHaveBeenCalled()
    act(() => result.current.closePicker())
    expect(result.current.draftValue).toEqual(props.value)
    expect(onChange).not.toHaveBeenCalled()
    act(() => result.current.openPicker())
    act(() => result.current.togglePointFromMapOrList(visiblePoints[1]))
    act(() => result.current.handleApply())
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(['OUTSIDE', 'VISIBLE-1', 'VISIBLE-2'])
  })

  it('excludes points hidden by the selected-only map filter', () => {
    const { result } = measuredPicker()
    act(() => result.current.toggleSelectedOnlyInMap())

    expect(result.current.visibleCollectionPointIds).toEqual(['VISIBLE-1'])
    act(() => result.current.selectVisibleCollectionPointIds())
    expect(result.current.draftValue).toEqual(props.value)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('excludes offscreen points inside the geographic bounding box of a rotated map', () => {
    const { result } = measuredPicker()
    act(() =>
      result.current.handleViewStateChange({ ...viewport, bearing: 45 }),
    )
    // Geographic bounds are conservative for a rotated screen rectangle.
    expect(result.current.listBuckets.visibleIds.has('MARGIN')).toBe(true)

    expect(result.current.visibleCollectionPointIds).toEqual(
      visiblePoints.map((point) => point.cetRioCode),
    )
    act(() => result.current.selectVisibleCollectionPointIds())
    expect(result.current.draftValue).not.toContain('MARGIN')
  })
})
