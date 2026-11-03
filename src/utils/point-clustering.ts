import {
  type Color,
  type MapViewState,
  WebMercatorViewport,
} from '@deck.gl/core'
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import type { Feature, Point } from 'geojson'
import Supercluster from 'supercluster'

export interface ClusterablePoint<T = unknown> {
  id: string
  coordinates: [number, number]
  origin: string
  point: T
}

export interface PointClusterProperties {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: number | string
  originCounts: Record<string, number>
}

export interface IndexedPointProperties<T = unknown> {
  point: T
  origin: string
}

export type ClusterFeature<T = unknown> = Feature<
  Point,
  PointClusterProperties | IndexedPointProperties<T>
>

export type PointClusterIndex<T = unknown> = Supercluster<
  IndexedPointProperties<T>,
  Omit<
    PointClusterProperties,
    'cluster' | 'cluster_id' | 'point_count' | 'point_count_abbreviated'
  >
>

export function createPointClusterIndex<T>(
  points: ClusterablePoint<T>[],
): PointClusterIndex<T> {
  const index = new Supercluster<
    IndexedPointProperties<T>,
    Omit<
      PointClusterProperties,
      'cluster' | 'cluster_id' | 'point_count' | 'point_count_abbreviated'
    >
  >({
    radius: 50,
    maxZoom: 16,
    minZoom: 0,
    map: ({ origin }) => ({ originCounts: { [origin || 'Outra origem']: 1 } }),
    reduce: (aggregate, properties) => {
      Object.entries(properties.originCounts).forEach(([origin, count]) => {
        aggregate.originCounts[origin] =
          (aggregate.originCounts[origin] ?? 0) + count
      })
    },
  })

  index.load(
    points
      .filter(
        ({ coordinates }) =>
          Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1]),
      )
      .map(({ id, coordinates, origin, point }) => ({
        type: 'Feature' as const,
        id,
        geometry: { type: 'Point' as const, coordinates },
        properties: { point, origin: origin || 'Outra origem' },
      })),
  )

  return index
}

export function getMapBounds(
  viewport: MapViewState,
  width: number,
  height: number,
): [number, number, number, number] {
  const safeWidth = Math.max(1, width)
  const safeHeight = Math.max(1, height)
  const mapViewport = new WebMercatorViewport({
    ...viewport,
    width: safeWidth,
    height: safeHeight,
    pitch: viewport.pitch ?? 0,
    bearing: viewport.bearing ?? 0,
  })
  const [west, south] = mapViewport.unproject([-64, safeHeight + 64])
  const [east, north] = mapViewport.unproject([safeWidth + 64, -64])

  return [
    Math.max(-180, west),
    Math.max(-85, south),
    Math.min(180, east),
    Math.min(85, north),
  ]
}

export function createClusterLayers<T>(
  id: string,
  clusters: ClusterFeature<T>[],
  onClick?: (feature: ClusterFeature<T>) => void,
  onHover?: (feature: ClusterFeature<T> | null) => void,
  fillColor: Color = [0, 0, 0, 216],
) {
  const clusterFeatures = clusters.filter((feature) =>
    Boolean(feature.properties && 'cluster' in feature.properties),
  )

  const circles = new ScatterplotLayer<ClusterFeature<T>>({
    id: `${id}-circles`,
    data: clusterFeatures,
    pickable: true,
    autoHighlight: true,
    radiusUnits: 'pixels',
    getPosition: (feature) => feature.geometry.coordinates as [number, number],
    getRadius: (feature) => {
      const count =
        feature.properties && 'point_count' in feature.properties
          ? feature.properties.point_count
          : 2
      return Math.min(36, 9 + Math.log2(count) * 2)
    },
    radiusMinPixels: 9,
    radiusMaxPixels: 36,
    stroked: true,
    filled: true,
    getFillColor: fillColor,
    getLineColor: [255, 255, 255, 245],
    lineWidthMinPixels: 2,
    onClick: (info) => {
      const feature = info.object
      if (feature && feature.properties && 'cluster_id' in feature.properties) {
        onClick?.(feature)
      }
    },
    onHover: (info) => {
      const feature = info.object
      onHover?.(
        feature?.properties && 'cluster_id' in feature.properties
          ? feature
          : null,
      )
    },
  })

  const labels = new TextLayer<ClusterFeature<T>>({
    id: `${id}-counts`,
    data: clusterFeatures,
    pickable: false,
    getPosition: (feature) => feature.geometry.coordinates as [number, number],
    getText: (feature) =>
      feature.properties && 'point_count' in feature.properties
        ? String(feature.properties.point_count)
        : '',
    getColor: [255, 255, 255, 255],
    getSize: 13,
    fontWeight: 700,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
  })

  return [circles, labels] as const
}

export function getClusterOriginCounts<T>(feature: ClusterFeature<T>) {
  if (feature.properties && 'originCounts' in feature.properties) {
    return feature.properties.originCounts
  }

  return {}
}
