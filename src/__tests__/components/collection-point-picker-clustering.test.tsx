import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
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

const point: CollectionPoint = {
  cetRioCode: 'A',
  company: 'CIVITAS',
  longitude: -43.2,
  latitude: -22.9,
  location: 'Centro',
  district: 'Centro',
  direction: null,
  lane: null,
  lastDetectionTime: null,
  activeInLast24Hours: true,
}
const points = [point, { ...point, cetRioCode: 'B', company: 'GABRIEL' }]
const props = { value: [], onChange: jest.fn() }
const viewport = {
  longitude: -43.2,
  latitude: -22.9,
  zoom: 16,
  pitch: 35,
  bearing: 60,
}

describe('collection point picker cluster interactions', () => {
  it('expands the clicked cluster, clears hover and keeps selection and camera orientation', () => {
    const { result } = renderHook(() => useCollectionPointPickerState(props))
    act(() => result.current.handleViewStateChange(viewport))
    const circles = result.current.mapLayers.find((layer) =>
      layer?.id.endsWith('-clusters-circles'),
    )
    if (!circles) throw new Error('Missing picker cluster layer')
    const [cluster] = Array.from(circles.props.data as Iterable<ClusterFeature>)
    type Event = Parameters<NonNullable<typeof circles.props.onClick>>[1]
    act(() =>
      circles.props.onHover?.({ object: cluster } as PickingInfo, {} as Event),
    )
    expect(result.current.hoveredPointClusterOriginCounts).toEqual({
      CIVITAS: 1,
      GABRIEL: 1,
    })

    act(() =>
      circles.props.onClick?.({ object: cluster } as PickingInfo, {} as Event),
    )

    expect(result.current.viewState).toEqual(
      expect.objectContaining({
        ...viewport,
        longitude: cluster.geometry.coordinates[0],
        latitude: cluster.geometry.coordinates[1],
        zoom: 17,
        transitionDuration: 350,
      }),
    )
    expect(result.current.hoveredPointCluster).toBeNull()
    expect(result.current.popupState).toBeNull()
    expect(result.current.draftValue).toEqual([])
    const icons = result.current.mapLayers.find(
      (layer) => layer?.id === 'collection-point-picker-point-layer',
    )
    expect(icons?.props.data).toEqual(expect.arrayContaining(points))
    if (!(icons instanceof IconLayer))
      throw new Error('Missing picker icon layer')
    act(() =>
      icons.props.onClick?.(
        { object: point } as PickingInfo<CollectionPoint>,
        {} as Event,
      ),
    )
    expect(result.current.draftValue).toEqual(['A'])
    expect(props.onChange).toHaveBeenCalledWith(['A'])
  })

  it('retains aggregates up to fractional zoom 16.99 and restores individual points at 17', () => {
    const { result } = renderHook(() => useCollectionPointPickerState(props))
    act(() =>
      result.current.handleViewStateChange({ ...viewport, zoom: 16.99 }),
    )
    const circles = result.current.mapLayers.find((layer) =>
      layer?.id.endsWith('-clusters-circles'),
    )
    if (!circles) throw new Error('Missing picker cluster layer')
    expect(
      Array.from(circles.props.data as Iterable<ClusterFeature>)[0].properties
        .point_count,
    ).toBe(2)

    act(() => result.current.handleViewStateChange({ ...viewport, zoom: 17 }))

    const icons = result.current.mapLayers.find(
      (layer) => layer?.id === 'collection-point-picker-point-layer',
    )
    expect(icons?.props.data).toEqual(expect.arrayContaining(points))
    const expandedCircles = result.current.mapLayers.find((layer) =>
      layer?.id.endsWith('-clusters-circles'),
    )
    expect(expandedCircles?.props.data).toEqual([])
  })
})
