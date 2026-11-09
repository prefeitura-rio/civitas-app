import {
  type Color,
  type MapViewState,
  WebMercatorViewport,
} from '@deck.gl/core'
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import Supercluster from 'supercluster'

import {
  POINT_CLUSTER_APPEARANCE,
  POINT_CLUSTER_EXPANSION_DURATION_MS,
  POINT_CLUSTER_INDEX_OPTIONS,
} from './point-cluster-config'

// Include nearby offscreen points so icons/clusters do not pop at the screen edge.
const CLUSTER_QUERY_MARGIN_PX = 64

export interface ClusterablePoint<T = unknown> {
  id: string
  /** Geographic coordinates in [longitude, latitude] order, in degrees. */
  coordinates: [number, number]
  origin: string
  point: T
}

export interface ClusterOriginProperties {
  originCounts: Record<string, number>
}

export interface IndexedPointProperties<T = unknown> {
  point: T
  origin: string
}

/** Native aggregate with origin counts, without an individual point payload. */
export type ClusterFeature =
  Supercluster.ClusterFeature<ClusterOriginProperties>

/** Native indexed point retaining its original domain payload. */
export type IndexedPointFeature<T = unknown> = Supercluster.PointFeature<
  IndexedPointProperties<T>
>

/** Native spatial query result: an aggregate or an original indexed point. */
export type ClusterQueryFeature<T = unknown> =
  | ClusterFeature
  | IndexedPointFeature<T>

export type PointClusterIndex<T = unknown> = Supercluster<
  IndexedPointProperties<T>,
  ClusterOriginProperties
>

/**
 * Narrows a spatial query result using Supercluster's `cluster: true` marker.
 *
 * @remarks
 * Accepts results from the typed index, not arbitrary or unvalidated GeoJSON.
 * A similarly named field nested inside the original point is not a marker.
 */
export function isClusterFeature<T>(
  feature: ClusterQueryFeature<T>,
): feature is ClusterFeature {
  return 'cluster' in feature.properties && feature.properties.cluster === true
}

/**
 * Narrows a spatial query result to an indexed point, retaining its payload type.
 * Uses the same cluster discriminator as `isClusterFeature`.
 */
export function isIndexedPointFeature<T>(
  feature: ClusterQueryFeature<T>,
): feature is IndexedPointFeature<T> {
  return !isClusterFeature(feature)
}

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
    ClusterOriginProperties
  >({
    ...POINT_CLUSTER_INDEX_OPTIONS,
    map: ({ origin }) => ({ originCounts: { [origin || 'Outra origem']: 1 } }),
    reduce: (aggregate, properties) => {
      // Supercluster shallow-copies cluster properties between zoom levels.
      // Own the nested counts before updating, preserving child aggregates.
      aggregate.originCounts = { ...aggregate.originCounts }
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

/** Geographic center in degrees and the native zoom where an aggregate splits. */
export type ClusterExpansionTarget = Pick<
  MapViewState,
  'longitude' | 'latitude' | 'zoom'
>

/**
 * Adapts Supercluster's native expansion result to a camera target.
 *
 * @param index - The same index that produced the clicked cluster; IDs belong to that index.
 * @param cluster - Aggregate to expand. Its center is already in longitude/latitude order.
 * @returns Center and first split zoom, without animation or camera side effects.
 * Callers retain ownership of their camera setter and hover/popup cleanup.
 */
export function getClusterExpansionTarget<T>(
  index: Pick<PointClusterIndex<T>, 'getClusterExpansionZoom'>,
  cluster: ClusterFeature,
): ClusterExpansionTarget {
  return {
    longitude: cluster.geometry.coordinates[0],
    latitude: cluster.geometry.coordinates[1],
    zoom: index.getClusterExpansionZoom(cluster.properties.cluster_id),
  }
}

/**
 * Prepares the animated Deck.gl camera update used by vehicles and the LPR picker.
 *
 * @param viewport - Latest camera state; orientation, constraints and other fields are preserved.
 * @param index - Index that produced the clicked aggregate.
 * @param cluster - Aggregate to expand using the native first split zoom.
 * @returns A new view state with the shared transition duration in milliseconds.
 * Never zooms out if the camera has already advanced beyond the picked cluster.
 */
export function getExpandedClusterViewState<T>(
  viewport: MapViewState,
  index: Pick<PointClusterIndex<T>, 'getClusterExpansionZoom'>,
  cluster: ClusterFeature,
): MapViewState {
  const target = getClusterExpansionTarget(index, cluster)
  return {
    ...viewport,
    ...target,
    zoom: Math.max(viewport.zoom ?? 0, target.zoom),
    transitionDuration: POINT_CLUSTER_EXPANSION_DURATION_MS,
  }
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
  clusters: ClusterQueryFeature<T>[],
  onClick?: (feature: ClusterFeature) => void,
  onHover?: (feature: ClusterFeature | null) => void,
  fillColor: Color = POINT_CLUSTER_APPEARANCE.defaultFillColor,
) {
  const clusterFeatures = clusters.filter(isClusterFeature)

  const circles = new ScatterplotLayer<ClusterFeature>({
    id: `${id}-circles`,
    data: clusterFeatures,
    pickable: true,
    autoHighlight: true,
    radiusUnits: 'pixels',
    getPosition: (feature) => feature.geometry.coordinates as [number, number],
    getRadius: (feature) => getClusterRadiusPx(feature.properties.point_count),
    radiusMinPixels: POINT_CLUSTER_APPEARANCE.minRadiusPx,
    radiusMaxPixels: POINT_CLUSTER_APPEARANCE.maxRadiusPx,
    stroked: true,
    filled: true,
    getFillColor: fillColor,
    getLineColor: POINT_CLUSTER_APPEARANCE.borderColor,
    lineWidthMinPixels: POINT_CLUSTER_APPEARANCE.borderWidthPx,
    onClick: (info) => {
      const feature = info.object
      if (feature) onClick?.(feature)
    },
    onHover: (info) => {
      const feature = info.object
      onHover?.(feature ?? null)
    },
  })

  const labels = new TextLayer<ClusterFeature>({
    id: `${id}-counts`,
    data: clusterFeatures,
    pickable: false,
    getPosition: (feature) => feature.geometry.coordinates as [number, number],
    getText: (feature) => String(feature.properties.point_count),
    getColor: POINT_CLUSTER_APPEARANCE.labelColor,
    getSize: POINT_CLUSTER_APPEARANCE.labelSizePx,
    fontWeight: POINT_CLUSTER_APPEARANCE.labelFontWeight,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
  })

  return [circles, labels] as const
}

/** Logarithmic radius in CSS pixels: count doublings add equal size, capped to keep labels readable. */
function getClusterRadiusPx(pointCount: number): number {
  return Math.min(
    POINT_CLUSTER_APPEARANCE.maxRadiusPx,
    POINT_CLUSTER_APPEARANCE.minRadiusPx +
      Math.log2(pointCount) *
        POINT_CLUSTER_APPEARANCE.radiusGrowthPxPerDoubling,
  )
}

/**
 * Reads the origin counts already aggregated by the spatial index.
 *
 * @returns The existing counts object, which callers should treat as read-only,
 * or an empty object for individual indexed points.
 */
export function getClusterOriginCounts<T>(feature: ClusterQueryFeature<T>) {
  if (isClusterFeature(feature)) {
    return feature.properties.originCounts
  }

  return {}
}
