/** @jest-environment node */
import type { MapViewState } from '@deck.gl/core'

import {
  createPointClusterIndex,
  getClusterExpansionTarget,
  getExpandedClusterViewState,
  isClusterFeature,
  isIndexedPointFeature,
} from '@/utils/point-clustering'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual('../../../node_modules/supercluster/dist/supercluster.js'),
)

const bounds: [number, number, number, number] = [-45, -24, -42, -21]
const points = [
  {
    id: 'A',
    coordinates: [-43.2, -22.9] as [number, number],
    origin: 'CIVITAS',
    point: { code: 'A' },
  },
  {
    id: 'B',
    coordinates: [-43.2, -22.9] as [number, number],
    origin: 'GABRIEL',
    point: { code: 'B' },
  },
  {
    id: 'C',
    coordinates: [-43.19, -22.9] as [number, number],
    origin: 'CETRIO',
    point: { code: 'C' },
  },
]

describe('native cluster expansion integration', () => {
  it('uses the native first split, without reading leaves or recalculating origin counts', () => {
    const index = createPointClusterIndex(points)
    const cluster = index.getClusters(bounds, 8).filter(isClusterFeature)[0]
    const nativeZoom = index.getClusterExpansionZoom(
      cluster.properties.cluster_id,
    )
    const expansion = jest.spyOn(index, 'getClusterExpansionZoom')
    const leaves = jest.spyOn(index, 'getLeaves')
    const counts = { ...cluster.properties.originCounts }

    const target = getClusterExpansionTarget(index, cluster)

    expect(expansion).toHaveBeenCalledWith(cluster.properties.cluster_id)
    expect(target).toEqual({
      longitude: cluster.geometry.coordinates[0],
      latitude: cluster.geometry.coordinates[1],
      zoom: nativeZoom,
    })
    expect(nativeZoom).toBeLessThan(17)
    expect(index.getClusters(bounds, target.zoom).length).toBeGreaterThan(1)
    expect(leaves).not.toHaveBeenCalled()
    expect(cluster.properties.originCounts).toEqual(counts)
  })

  it('preserves camera orientation and other state while applying the shared transition', () => {
    const index = createPointClusterIndex(points)
    const cluster = index.getClusters(bounds, 8).filter(isClusterFeature)[0]
    const viewport: MapViewState = {
      longitude: -44,
      latitude: -23,
      zoom: 8,
      pitch: 45,
      bearing: 75,
      minZoom: 2,
      maxZoom: 20,
      transitionDuration: 100,
    }
    const before = { ...viewport }

    const expanded = getExpandedClusterViewState(viewport, index, cluster)

    expect(expanded).toEqual({
      ...before,
      ...getClusterExpansionTarget(index, cluster),
      transitionDuration: 350,
    })
    expect(viewport).toEqual(before)
  })

  it('never zooms out if the camera has advanced beyond the picked cluster', () => {
    const index = createPointClusterIndex(points)
    const cluster = index.getClusters(bounds, 8).filter(isClusterFeature)[0]

    expect(
      getExpandedClusterViewState(
        { longitude: -44, latitude: -23, zoom: 18 },
        index,
        cluster,
      ).zoom,
    ).toBe(18)
  })

  it('expands coincident points at the actual final index level', () => {
    const index = createPointClusterIndex(points.slice(0, 2))
    const cluster = index.getClusters(bounds, 16).filter(isClusterFeature)[0]
    const target = getClusterExpansionTarget(index, cluster)

    expect(target.zoom).toBe(17)
    const leaves = index
      .getClusters(bounds, target.zoom)
      .filter(isIndexedPointFeature)
    expect(leaves.map((feature) => feature.properties.point)).toEqual(
      points.slice(0, 2).map((point) => point.point),
    )
  })
})
