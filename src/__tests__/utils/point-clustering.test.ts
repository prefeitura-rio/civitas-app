/** @jest-environment node */
import { type MapViewState, WebMercatorViewport } from '@deck.gl/core'

import { createPointClusterIndex, getMapBounds } from '@/utils/point-clustering'

// Exercise real projection and spatial queries instead of the global Deck.gl mocks.
jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual('../../../node_modules/supercluster/dist/supercluster.js'),
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
