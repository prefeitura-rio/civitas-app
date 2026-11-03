import { type Layer, type LayersList, type PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { act, renderHook } from '@testing-library/react'

import { useClusteredMapLayers } from '@/hooks/maps/use-clustered-map-layers'
import type { ClusterFeature } from '@/utils/point-clustering'
import { createPointClusterIndex } from '@/utils/point-clustering'
import {
  getPointClusterLayerPrefix,
  POINT_CLUSTER_GROUPS,
  POINT_LAYER_IDS,
  type PointLayerId,
} from '@/utils/point-layer-config'
import {
  preparePointSource,
  type VisiblePointSource,
} from '@/utils/point-layer-sources'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual(
    '../../../../node_modules/supercluster/dist/supercluster.js',
  ),
)
jest.mock('@/utils/point-clustering', () => {
  const actual = jest.requireActual('@/utils/point-clustering')
  return {
    ...actual,
    createPointClusterIndex: jest.fn(actual.createPointClusterIndex),
  }
})

// A deliberately different schema verifies that the hook does not guess domain fields.
const records = [
  { uid: 'A', coords: [-43.2, -22.9] as [number, number], provider: 'CIVITAS' },
  { uid: 'B', coords: [-43.2, -22.9] as [number, number], provider: 'GABRIEL' },
]
const adapter = {
  getId: (point: (typeof records)[number]) => point.uid,
  getCoordinates: (point: (typeof records)[number]) => point.coords,
  getOrigin: (point: (typeof records)[number]) => point.provider,
}
const viewport = { longitude: -43.2, latitude: -22.9, zoom: 12 }
const size = { width: 1000, height: 600 }
const setViewport = jest.fn()

function source(
  layerId: PointLayerId = POINT_LAYER_IDS.radars,
): VisiblePointSource {
  return { ...preparePointSource(layerId, records, adapter), visible: true }
}

function layer(id: string): Layer {
  return new IconLayer({ id, data: [{ unrelatedToTheSource: true }] })
}

function findLayer(layers: LayersList, id: string): Layer {
  const found = layers.find(
    (candidate) =>
      candidate && !Array.isArray(candidate) && candidate.id === id,
  )
  if (!found || Array.isArray(found)) throw new Error(`Missing layer ${id}`)
  return found
}

describe('useClusteredMapLayers with explicit sources', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does not construct or query indexes for hidden sources', () => {
    const sources = [{ ...source(), visible: false }]
    const { result } = renderHook(() =>
      useClusteredMapLayers(
        [layer(POINT_LAYER_IDS.radars)],
        sources,
        viewport,
        size,
        setViewport,
      ),
    )

    expect(createPointClusterIndex).not.toHaveBeenCalled()
    expect(result.current.layers).toHaveLength(1)
    expect(
      findLayer(result.current.layers, POINT_LAYER_IDS.radars).props.visible,
    ).toBe(false)
  })

  it('reuses an index after hiding and showing unchanged source data', () => {
    const prepared = source()
    const baseLayers = [layer(prepared.layerId)]
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useClusteredMapLayers(
          baseLayers,
          [{ ...prepared, visible }],
          viewport,
          size,
          setViewport,
        ),
      { initialProps: { visible: true } },
    )
    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
    const query = jest.spyOn(
      jest.mocked(createPointClusterIndex).mock.results[0].value,
      'getClusters',
    )
    rerender({ visible: false })
    expect(result.current.layers).toHaveLength(1)
    expect(query).not.toHaveBeenCalled()
    rerender({ visible: true })

    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenCalledTimes(1)
    expect(
      findLayer(
        result.current.layers,
        `${getPointClusterLayerPrefix('lpr')}-circles`,
      ).props.visible,
    ).toBe(true)
  })

  it('excludes hidden sublayers from counts within a mixed LPR group', () => {
    const regular = {
      ...preparePointSource(POINT_LAYER_IDS.radars, [records[1]], adapter),
      visible: true,
    }
    const sentry = {
      ...preparePointSource(
        POINT_LAYER_IDS.radarsSentry,
        [records[0]],
        adapter,
      ),
      visible: false,
    }
    const { result, rerender } = renderHook(
      ({ sentryVisible }) =>
        useClusteredMapLayers(
          [layer(regular.layerId), layer(sentry.layerId)],
          [regular, { ...sentry, visible: sentryVisible }],
          viewport,
          size,
          setViewport,
        ),
      { initialProps: { sentryVisible: false } },
    )
    expect(result.current.layers).toHaveLength(2)
    expect(
      findLayer(result.current.layers, regular.layerId).props.data,
    ).toEqual([records[1]])
    rerender({ sentryVisible: true })
    const circles = findLayer(
      result.current.layers,
      `${getPointClusterLayerPrefix('lpr')}-circles`,
    )
    const [cluster] = Array.from(
      circles.props.data as Iterable<{
        properties: {
          originCounts: Record<string, number>
          point_count: number
        }
      }>,
    )
    expect(cluster.properties.originCounts).toEqual({ CIVITAS: 1, GABRIEL: 1 })
    expect(cluster.properties.point_count).toBe(2)
  })

  it('keeps categories separate even when all their points coincide', () => {
    const sources = POINT_CLUSTER_GROUPS.map((group) =>
      source(group.layerIds[0]),
    )
    const baseLayers = sources.map((item) => layer(item.layerId))
    const { result } = renderHook(() =>
      useClusteredMapLayers(baseLayers, sources, viewport, size, setViewport),
    )

    expect(createPointClusterIndex).toHaveBeenCalledTimes(5)
    for (const group of POINT_CLUSTER_GROUPS) {
      expect(
        findLayer(
          result.current.layers,
          `${getPointClusterLayerPrefix(group.id)}-circles`,
        ).props,
      ).toEqual(expect.objectContaining({ getFillColor: group.color }))
    }
  })

  it('retains original point identity and leaves trip layers untouched at individual-point zoom', () => {
    const prepared = source()
    const trip = layer('trip-detections')
    const { result } = renderHook(() =>
      useClusteredMapLayers(
        [layer(prepared.layerId), trip],
        [prepared],
        { ...viewport, zoom: 17 },
        size,
        setViewport,
      ),
    )
    const points = findLayer(result.current.layers, prepared.layerId).props.data

    expect(points).toEqual(records)
    expect(Array.from(points as Iterable<unknown>)[0]).toBe(records[0])
    expect(findLayer(result.current.layers, trip.id)).toBe(trip)
  })

  it('prepares no additional indexes when only layer presentation changes', () => {
    const prepared = source()
    const { rerender } = renderHook(
      ({ selected }) =>
        useClusteredMapLayers(
          [
            new IconLayer({
              id: prepared.layerId,
              data: [],
              getSize: selected ? 30 : 24,
            }),
          ],
          [prepared],
          viewport,
          size,
          setViewport,
        ),
      { initialProps: { selected: false } },
    )
    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
    rerender({ selected: true })
    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
  })

  it('rebuilds only the group whose prepared data changed', () => {
    const first = source()
    const second = source(POINT_LAYER_IDS.cameras)
    const { rerender } = renderHook(
      ({ changed }) =>
        useClusteredMapLayers(
          [layer(first.layerId), layer(second.layerId)],
          [changed, second],
          viewport,
          size,
          setViewport,
        ),
      { initialProps: { changed: first } },
    )
    expect(createPointClusterIndex).toHaveBeenCalledTimes(2)
    rerender({
      changed: {
        ...preparePointSource(first.layerId, records.slice(0, 1), adapter),
        visible: true,
      },
    })
    expect(createPointClusterIndex).toHaveBeenCalledTimes(3)
  })

  it('clears cluster hover when a source is hidden, without rebuilding the index', () => {
    const prepared = source()
    const baseLayers = [layer(prepared.layerId)]
    const { result, rerender } = renderHook(
      ({ sources }) =>
        useClusteredMapLayers(baseLayers, sources, viewport, size, setViewport),
      { initialProps: { sources: [prepared] } },
    )
    const circles = findLayer(
      result.current.layers,
      `${getPointClusterLayerPrefix('lpr')}-circles`,
    )
    const [cluster] = Array.from(circles.props.data as Iterable<ClusterFeature>)
    type HoverEvent = Parameters<NonNullable<typeof circles.props.onHover>>[1]
    act(() => {
      circles.props.onHover?.(
        { object: cluster } as PickingInfo,
        {} as HoverEvent,
      )
    })
    expect(result.current.hoveredOriginCounts).toEqual({
      CIVITAS: 1,
      GABRIEL: 1,
    })

    rerender({ sources: [{ ...prepared, visible: false }] })

    expect(result.current.hoveredCluster).toBeNull()
    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
  })

  it('expands a clicked cluster with the native zoom and clears hover without rebuilding', () => {
    const prepared = source()
    const sources = [prepared]
    const camera = { ...viewport, pitch: 40, bearing: 65 }
    const { result } = renderHook(() =>
      useClusteredMapLayers(
        [layer(prepared.layerId)],
        sources,
        camera,
        size,
        setViewport,
      ),
    )
    const circles = findLayer(
      result.current.layers,
      `${getPointClusterLayerPrefix('lpr')}-circles`,
    )
    const [cluster] = Array.from(circles.props.data as Iterable<ClusterFeature>)
    const index = jest.mocked(createPointClusterIndex).mock.results[0].value
    const nativeZoom = index.getClusterExpansionZoom(
      cluster.properties.cluster_id,
    )
    type Event = Parameters<NonNullable<typeof circles.props.onClick>>[1]
    act(() =>
      circles.props.onHover?.({ object: cluster } as PickingInfo, {} as Event),
    )
    expect(result.current.hoveredCluster).toBe(cluster)

    act(() =>
      circles.props.onClick?.({ object: cluster } as PickingInfo, {} as Event),
    )

    expect(setViewport).toHaveBeenCalledWith({
      ...camera,
      longitude: cluster.geometry.coordinates[0],
      latitude: cluster.geometry.coordinates[1],
      zoom: nativeZoom,
      transitionDuration: 350,
    })
    expect(result.current.hoveredCluster).toBeNull()
    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
  })

  it('keeps a continuous representation across the final fractional cluster zoom', () => {
    const prepared = source()
    const sources = [prepared]
    const baseLayers = [layer(prepared.layerId)]
    const { result, rerender } = renderHook(
      ({ zoom }) =>
        useClusteredMapLayers(
          baseLayers,
          sources,
          { ...viewport, zoom },
          size,
          setViewport,
        ),
      { initialProps: { zoom: 16 } },
    )
    const clusterId = `${getPointClusterLayerPrefix('lpr')}-circles`
    expect(
      Array.from(
        findLayer(result.current.layers, clusterId).props
          .data as Iterable<ClusterFeature>,
      )[0].properties.point_count,
    ).toBe(2)
    expect(
      findLayer(result.current.layers, prepared.layerId).props.data,
    ).toEqual([])

    rerender({ zoom: 16.99 })
    expect(
      Array.from(
        findLayer(result.current.layers, clusterId).props
          .data as Iterable<ClusterFeature>,
      )[0].properties.point_count,
    ).toBe(2)
    expect(
      findLayer(result.current.layers, prepared.layerId).props.data,
    ).toEqual([])

    rerender({ zoom: 17 })
    expect(
      result.current.layers.some(
        (item) => item && !Array.isArray(item) && item.id === clusterId,
      ),
    ).toBe(false)
    expect(
      findLayer(result.current.layers, prepared.layerId).props.data,
    ).toEqual(records)
    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
  })
})
