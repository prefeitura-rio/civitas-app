import {
  type Color,
  type MapViewState,
  WebMercatorViewport,
} from '@deck.gl/core'
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import type { Feature, Point } from 'geojson'
import Supercluster from 'supercluster'

// Include nearby offscreen points so icons/clusters do not pop at the screen edge.
const CLUSTER_QUERY_MARGIN_PX = 64

export interface ClusterablePoint<T = unknown> {
  id: string
  /** Geographic coordinates in [longitude, latitude] order, in degrees. */
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

/**
 * Builds an immutable spatial index with point counts grouped by origin.
 *
 * @remarks
 * Points with non-finite coordinates are omitted. Empty origins use
 * "Outra origem"; other origin labels are preserved without normalization.
 * Rebuild the index when its input data changes, not for camera or hover changes.
 *
 * @param points - Source points with coordinates in longitude/latitude order.
 * @returns A loaded Supercluster index whose individual features retain the
 * original point objects in their properties.
 */
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

/**
 * Returns geographic bounds for a map viewport, optionally expanded offscreen.
 *
 * @remarks
 * The query margin preserves the original camera distance and perspective.
 * Width and height below one pixel are treated as one pixel during initial layout.
 * Longitudes are not wrapped or clamped: Supercluster handles antimeridian and
 * whole-world queries when these bounds are passed to `getClusters`.
 *
 * @param viewport - Current map camera state.
 * @param width - Map width in CSS pixels.
 * @param height - Map height in CSS pixels.
 * @param marginPx - Non-negative margin on each edge in CSS pixels; defaults to 64.
 * Use zero for viewport visibility checks rather than expanded cluster queries.
 * @returns Bounds in [west, south, east, north] order, in degrees. Longitudes
 * may extend beyond the canonical [-180, 180] range.
 */
export function getMapBounds(
  viewport: MapViewState,
  width: number,
  height: number,
  marginPx = CLUSTER_QUERY_MARGIN_PX,
): [number, number, number, number] {
  const safeWidth = Math.max(1, width)
  const safeHeight = Math.max(1, height)
  const mapViewport = new WebMercatorViewport({
    ...viewport,
    width: safeWidth,
    height: safeHeight,
  })

  if (marginPx === 0) return mapViewport.getBounds()

  const queryHeight = safeHeight + marginPx * 2
  const queryViewport = new WebMercatorViewport({
    ...viewport,
    width: safeWidth + marginPx * 2,
    height: queryHeight,
    // Altitude is relative to height. Keep the camera distance unchanged while
    // enlarging the query viewport, including when the map is tilted.
    altitude: (mapViewport.altitude * safeHeight) / queryHeight,
  })

  // Supercluster handles longitude wrapping, antimeridian and whole-world queries.
  return queryViewport.getBounds()
}

/**
 * Creates interactive cluster circles and non-interactive count labels.
 *
 * @remarks
 * Individual point features are ignored and must be rendered by their own layer.
 * This function renders clusters; the caller owns visibility and camera updates.
 *
 * @param id - Unique prefix for the generated `-circles` and `-counts` layer IDs.
 * @param clusters - Spatial query results containing clusters and individual points.
 * @param onClick - Called with a cluster when its circle is clicked.
 * @param onHover - Called with the hovered cluster, or null when none is picked.
 * @param fillColor - Circle fill with RGB or RGBA components from 0 to 255.
 * @returns Layers ordered as [circles, labels], so labels render above circles.
 */
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

/**
 * Reads the origin counts already aggregated by the spatial index.
 *
 * @returns The existing counts object, which callers should treat as read-only,
 * or an empty object for individual points or features without an aggregation.
 */
export function getClusterOriginCounts<T>(feature: ClusterFeature<T>) {
  if (feature.properties && 'originCounts' in feature.properties) {
    return feature.properties.originCounts
  }

  return {}
}
