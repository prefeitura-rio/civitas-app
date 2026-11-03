/** @jest-environment node */
import { type MapViewState, WebMercatorViewport } from '@deck.gl/core'
import type Supercluster from 'supercluster'

import {
  type ClusterablePoint,
  createClusterLayers,
  createPointClusterIndex,
  getClusterOriginCounts,
  getMapBounds,
  type IndexedPointProperties,
  isClusterFeature,
  isIndexedPointFeature,
} from '@/utils/point-clustering'

// Exercise real projection and spatial queries instead of the global Deck.gl mocks.
jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual('../../../node_modules/supercluster/dist/supercluster.js'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)

const width = 1000
const height = 600
const viewState: MapViewState = {
  longitude: -43.2,
  latitude: -22.9,
  zoom: 12,
}

function queryScreenPoints(
  viewport: MapViewState,
  screenPoints: [number, number][],
  size = { width, height },
  paddingPx?: number,
) {
  const projection = new WebMercatorViewport({ ...viewport, ...size })
  const points = screenPoints.map((screenPoint, id) => {
    const [longitude, latitude] = projection.unproject(screenPoint)
    return {
      id: String(id),
      // Input data uses canonical longitudes, even across repeated world copies.
      coordinates: [
        ((((longitude + 180) % 360) + 360) % 360) - 180,
        latitude,
      ] as [number, number],
      origin: 'Test',
      point: id,
    }
  })
  const bounds = getMapBounds(viewport, size.width, size.height, paddingPx)
  const results = createPointClusterIndex(points).getClusters(bounds, 17)
  return { bounds, ids: results.map((feature) => feature.id).sort() }
}

const screenGrid: [number, number][] = [0.05, 0.5, 0.95].flatMap((x) =>
  [0.05, 0.5, 0.95].map((y) => [x * width, y * height] as [number, number]),
)
const gridIds = screenGrid.map((_, id) => String(id)).sort()

describe('getMapBounds', () => {
  describe.each([0, 30, 60])('pitch %s', (pitch) => {
    it.each([0, 45, 90, 135, 180, 270])(
      'retains visible points with bearing %s',
      (bearing) => {
        const { bounds, ids } = queryScreenPoints(
          { ...viewState, pitch, bearing },
          screenGrid,
        )

        expect(bounds.every(Number.isFinite)).toBe(true)
        expect(bounds[0]).toBeLessThan(bounds[2])
        expect(bounds[1]).toBeLessThan(bounds[3])
        expect(ids).toEqual(gridIds)
      },
    )
  })

  it.each([-179.9995, 179.9995])(
    'retains points on both sides of the antimeridian at longitude %s',
    (longitude) => {
      const { ids } = queryScreenPoints(
        { ...viewState, longitude, pitch: 30, bearing: 45 },
        screenGrid,
      )

      expect(ids).toEqual(gridIds)
    },
  )

  it('lets Supercluster query all longitudes when several world copies are visible', () => {
    const size = { width: 2000, height: 200 }
    const { bounds, ids } = queryScreenPoints(
      { longitude: 0, latitude: 0, zoom: 0 },
      [
        [200, 100],
        [1000, 100],
        [1800, 100],
      ],
      size,
    )

    expect(bounds[2] - bounds[0]).toBeGreaterThanOrEqual(360)
    expect(ids).toEqual(['0', '1', '2'])
  })

  it.each([0, 30, 60])(
    'preserves the 64 px query margin on all sides with pitch %s',
    (pitch) => {
      const marginPoints: [number, number][] = [
        [-63, -63],
        [width + 63, -63],
        [width + 63, height + 63],
        [-63, height + 63],
      ]
      const { ids } = queryScreenPoints(
        { ...viewState, pitch, bearing: 45 },
        marginPoints,
      )

      expect(ids).toEqual(['0', '1', '2', '3'])
    },
  )

  it('excludes points beyond the query margin', () => {
    const { ids } = queryScreenPoints(viewState, [
      [-65, height / 2],
      [width + 65, height / 2],
      [width / 2, -65],
      [width / 2, height + 65],
    ])

    expect(ids).toEqual([])
  })

  it('uses only the visible area when the caller requests no margin', () => {
    const { ids } = queryScreenPoints(
      viewState,
      [
        [width / 2, height / 2],
        [-32, height / 2],
        [width + 32, height / 2],
      ],
      { width, height },
      0,
    )

    expect(ids).toEqual(['0'])
  })

  it('retains visible points above latitude 85 instead of clipping them', () => {
    const { ids } = queryScreenPoints({ ...viewState, latitude: 85.04 }, [
      [width / 2, height / 2],
    ])

    expect(ids).toEqual(['0'])
  })

  it('returns finite bounds before the container has a positive size', () => {
    const bounds = getMapBounds(viewState, 0, 0)

    expect(bounds.every(Number.isFinite)).toBe(true)
    expect(bounds[0]).toBeLessThan(bounds[2])
    expect(bounds[1]).toBeLessThan(bounds[3])
  })
})

describe('Supercluster feature contracts', () => {
  const payloads = [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }]
  const points: ClusterablePoint<(typeof payloads)[number]>[] = payloads.map(
    (point, index) => ({
      id: point.code,
      coordinates: index === 3 ? [-44.5, -22.9] : [-43.2, -22.9],
      origin: index === 1 ? 'GABRIEL' : 'CIVITAS',
      point,
    }),
  )

  function queryFeatures() {
    return createPointClusterIndex(points).getClusters([-45, -24, -42, -21], 12)
  }

  it('narrows native query results into clusters and points without array casts', () => {
    const features = queryFeatures()
    const clusters = features.filter(isClusterFeature)
    const leaves = features.filter(isIndexedPointFeature)

    // These assignments also verify compatibility with the installed native types.
    const cluster: Supercluster.ClusterFeature<{
      originCounts: Record<string, number>
    }> = clusters[0]
    const leaf: Supercluster.PointFeature<
      IndexedPointProperties<(typeof payloads)[number]>
    > = leaves[0]

    expect(clusters).toHaveLength(1)
    expect(leaves).toHaveLength(1)
    expect(cluster.properties.point_count).toBe(3)
    expect(leaf.properties.point).toBe(payloads[3])
    expect(leaf.id).toBe('D')
    // @ts-expect-error Aggregates have no individual point payload.
    expect(clusters[0].properties.point).toBeUndefined()
    // @ts-expect-error Individual points have no cluster identifier.
    expect(leaves[0].properties.cluster_id).toBeUndefined()
  })

  it('preserves origin aggregation when using native cluster properties', () => {
    const cluster = queryFeatures().filter(isClusterFeature)[0]

    expect(getClusterOriginCounts(cluster)).toEqual({ CIVITAS: 2, GABRIEL: 1 })
  })

  it('uses the true cluster flag rather than the mere presence of a property', () => {
    const point = queryFeatures().filter(isIndexedPointFeature)[0]
    const flaggedPoint = {
      ...point,
      properties: { ...point.properties, cluster: false },
    }

    expect(isClusterFeature(flaggedPoint)).toBe(false)
    expect(isIndexedPointFeature(flaggedPoint)).toBe(true)
  })

  it('does not confuse a cluster flag inside the original point with a cluster', () => {
    const [feature] = createPointClusterIndex([
      {
        id: 'A',
        coordinates: [-43.2, -22.9],
        origin: 'CIVITAS',
        point: { cluster: true, code: 'A' },
      },
    ]).getClusters([-45, -24, -42, -21], 12)

    expect(isIndexedPointFeature(feature)).toBe(true)
    expect(isClusterFeature(feature)).toBe(false)
    expect(getClusterOriginCounts(feature)).toEqual({})
  })

  it('gives cluster layers only clustered features and their native count', () => {
    const features = queryFeatures()
    const [circles, labels] = createClusterLayers('test-clusters', features)
    const cluster = features.filter(isClusterFeature)[0]

    expect(circles.props.data).toEqual([cluster])
    expect(labels.props.data).toEqual([cluster])
    expect(typeof labels.props.getText).toBe('function')
    if (typeof labels.props.getText === 'function') {
      expect(
        labels.props.getText(cluster, {
          index: 0,
          data: [cluster],
          target: [],
        }),
      ).toBe('3')
    }
  })

  it.each([
    [2, 11],
    [4, 13],
    [1024, 29],
    [2 ** 20, 36],
  ])(
    'preserves the logarithmic radius and cap for a count of %s',
    (count, expectedRadius) => {
      const cluster = queryFeatures().filter(isClusterFeature)[0]
      const feature = {
        ...cluster,
        properties: { ...cluster.properties, point_count: count },
      }
      const [circles] = createClusterLayers('test-radius', [feature])
      const getRadius = circles.props.getRadius
      if (typeof getRadius !== 'function')
        throw new Error('Missing radius accessor')

      expect(
        getRadius(feature, { index: 0, data: [feature], target: [] }),
      ).toBe(expectedRadius)
      expect(circles.props.radiusMinPixels).toBe(9)
      expect(circles.props.radiusMaxPixels).toBe(36)
    },
  )
})
