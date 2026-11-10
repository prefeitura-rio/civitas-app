import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  FillLayerSpecification,
  GeoJSONSourceSpecification,
  LayerSpecification,
  LineLayerSpecification,
} from 'mapbox-gl'

export const PLAYGROUND_MAP_IDS = {
  pointSource: 'playground-point-clusters',
  clusters: 'playground-point-clusters-circle',
  clusterLabels: 'playground-point-clusters-count',
  unclusteredPoints: 'playground-point-clusters-leaves',
} as const

export const PLAYGROUND_CLUSTER_OPTIONS = {
  /** Radius in tile pixels, using Mapbox's native GeoJSON clustering. */
  radiusPx: 48,
  /** Last integer zoom with aggregates; Draw takes over from maxZoom + 1. */
  maxZoom: 16,
}
export const PLAYGROUND_POINT_EDIT_MIN_ZOOM =
  PLAYGROUND_CLUSTER_OPTIONS.maxZoom + 1

export const PLAYGROUND_DRAW_APPEARANCE = {
  defaultColor: '#3bb2d0',
  activeColor: '#fbb03b',
  outlineColor: '#ffffff',
  polygonOpacity: 0.1,
  lineWidthPx: 2,
  // Matches the former native leaf: 7px fill radius plus a 1.5px outer stroke.
  pointOuterRadiusPx: 8.5,
  pointInnerRadiusPx: 7,
  // Keep selected points visibly larger than unselected ones.
  activeOuterRadiusPx: 10.5,
  activeInnerRadiusPx: 9,
  midpointRadiusPx: 3,
}

const clusterAppearance = {
  color: '#184a7a',
  baseRadiusPx: 18,
  radiusStops: [
    { minPoints: 25, radiusPx: 22 },
    { minPoints: 100, radiusPx: 27 },
    { minPoints: 500, radiusPx: 32 },
  ],
  borderWidthPx: 2,
  labelSizePx: 13,
}

// Mapbox places circle strokes outside the fill radius. Match Draw's inner fill
// with that radius, and its total outer radius with the fill plus stroke width.
const leafCircleRadiusPx = PLAYGROUND_DRAW_APPEARANCE.pointInnerRadiusPx
const leafBorderWidthPx =
  PLAYGROUND_DRAW_APPEARANCE.pointOuterRadiusPx -
  PLAYGROUND_DRAW_APPEARANCE.pointInnerRadiusPx

type DrawStyle =
  | Omit<CircleLayerSpecification, 'source'>
  | Omit<FillLayerSpecification, 'source'>
  | Omit<LineLayerSpecification, 'source'>

/**
 * Supplies the complete public Draw theme; Draw assigns its own hot/cold sources.
 *
 * @remarks
 * Inactive points are represented by the native cluster source below the edit zoom.
 * Selected points, polygon/line editing vertices and midpoints remain editable at
 * every zoom. Draw exposes application properties as `user_*` when userProperties
 * is enabled, so stored colors need no per-feature paint expressions or theme IDs.
 */
export function createPlaygroundDrawStyles(): DrawStyle[] {
  const appearance = PLAYGROUND_DRAW_APPEARANCE
  const featureColor: ExpressionSpecification = [
    'coalesce',
    ['get', 'user_color'],
    [
      'case',
      ['==', ['get', 'active'], 'true'],
      appearance.activeColor,
      appearance.defaultColor,
    ],
  ]
  const pointFilter = [
    'all',
    ['==', ['geometry-type'], 'Point'],
    ['==', ['get', 'meta'], 'feature'],
  ] as const
  const styles: DrawStyle[] = [
    {
      id: 'playground-draw-polygon-fill',
      type: 'fill',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': featureColor,
        'fill-opacity': appearance.polygonOpacity,
      },
    },
    {
      id: 'playground-draw-lines',
      type: 'line',
      filter: [
        'any',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['geometry-type'], 'Polygon'],
      ],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': featureColor,
        'line-width': appearance.lineWidthPx,
        'line-dasharray': [
          'case',
          ['==', ['get', 'active'], 'true'],
          ['literal', [0.2, 2]],
          ['literal', [2, 0]],
        ],
      },
    },
  ]
  for (const active of [false, true]) {
    for (const outer of [true, false]) {
      styles.push({
        id: `playground-draw-point-${active ? 'active' : 'inactive'}-${outer ? 'outer' : 'inner'}`,
        type: 'circle',
        ...(active ? {} : { minzoom: PLAYGROUND_POINT_EDIT_MIN_ZOOM }),
        filter: [
          'all',
          ...pointFilter.slice(1),
          ['==', ['get', 'active'], String(active)],
        ],
        paint: {
          'circle-color': outer ? appearance.outlineColor : featureColor,
          'circle-radius': active
            ? outer
              ? appearance.activeOuterRadiusPx
              : appearance.activeInnerRadiusPx
            : outer
              ? appearance.pointOuterRadiusPx
              : appearance.pointInnerRadiusPx,
        },
      })
    }
  }
  for (const outer of [true, false]) {
    styles.push({
      id: `playground-draw-vertex-${outer ? 'outer' : 'inner'}`,
      type: 'circle',
      filter: [
        'all',
        ['==', ['get', 'meta'], 'vertex'],
        ['!=', ['get', 'mode'], 'simple_select'],
      ],
      paint: {
        'circle-color': outer
          ? appearance.outlineColor
          : appearance.activeColor,
        'circle-radius': [
          'case',
          ['==', ['get', 'active'], 'true'],
          outer
            ? appearance.activeOuterRadiusPx
            : appearance.activeInnerRadiusPx,
          outer ? appearance.pointOuterRadiusPx : appearance.pointInnerRadiusPx,
        ],
      },
    })
  }
  styles.push({
    id: 'playground-draw-midpoint',
    type: 'circle',
    filter: ['==', ['get', 'meta'], 'midpoint'],
    paint: {
      'circle-color': appearance.activeColor,
      'circle-radius': appearance.midpointRadiusPx,
    },
  })
  return styles
}

/** Creates the native source; the clustering algorithm remains entirely in Mapbox. */
export function createPlaygroundPointSource(): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
    cluster: true,
    clusterRadius: PLAYGROUND_CLUSTER_OPTIONS.radiusPx,
    clusterMaxZoom: PLAYGROUND_CLUSTER_OPTIONS.maxZoom,
  }
}

/**
 * Renders clusters and unselected leaves strictly below the first individual Draw zoom.
 * Selected points are excluded from this source and use Draw at every zoom.
 */
export function createPlaygroundClusterLayers(): LayerSpecification[] {
  const source = PLAYGROUND_MAP_IDS.pointSource
  const maxzoom = PLAYGROUND_POINT_EDIT_MIN_ZOOM
  return [
    {
      id: PLAYGROUND_MAP_IDS.clusters,
      type: 'circle',
      source,
      maxzoom,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': clusterAppearance.color,
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          clusterAppearance.baseRadiusPx,
          ...clusterAppearance.radiusStops.flatMap(
            ({ minPoints, radiusPx }) => [minPoints, radiusPx],
          ),
        ],
        'circle-stroke-width': clusterAppearance.borderWidthPx,
        'circle-stroke-color': PLAYGROUND_DRAW_APPEARANCE.outlineColor,
      },
    },
    {
      id: PLAYGROUND_MAP_IDS.clusterLabels,
      type: 'symbol',
      source,
      maxzoom,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': clusterAppearance.labelSizePx,
      },
      paint: { 'text-color': PLAYGROUND_DRAW_APPEARANCE.outlineColor },
    },
    {
      id: PLAYGROUND_MAP_IDS.unclusteredPoints,
      type: 'circle',
      source,
      maxzoom,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': leafCircleRadiusPx,
        'circle-color': [
          'coalesce',
          ['get', 'color'],
          PLAYGROUND_DRAW_APPEARANCE.defaultColor,
        ],
        'circle-stroke-color': PLAYGROUND_DRAW_APPEARANCE.outlineColor,
        'circle-stroke-width': leafBorderWidthPx,
      },
    },
  ]
}
