import type { Color } from '@deck.gl/core'

/** Defaults shared by Deck.gl consumers of Supercluster; native Mapbox sources have their own policy. */
export const POINT_CLUSTER_INDEX_OPTIONS = {
  /** Radius in tile pixels, relative to Supercluster's default extent of 512. */
  radius: 50,
  minZoom: 0,
  /** Last integer zoom with aggregates; individual points are returned from maxZoom + 1. */
  maxZoom: 16,
}

/** Visual policy in CSS pixels; category fill colors remain in POINT_CLUSTER_COLORS. */
export const POINT_CLUSTER_APPEARANCE = {
  minRadiusPx: 9,
  maxRadiusPx: 36,
  /** Each doubling of the point count adds this many pixels to the base radius. */
  radiusGrowthPxPerDoubling: 2,
  defaultFillColor: [0, 0, 0, 216] satisfies Color,
  borderColor: [255, 255, 255, 245] satisfies Color,
  borderWidthPx: 2,
  labelColor: [255, 255, 255, 255] satisfies Color,
  labelSizePx: 13,
  labelFontWeight: 700,
}

/** Camera transition in milliseconds for cluster clicks in vehicles and the LPR picker. */
export const POINT_CLUSTER_EXPANSION_DURATION_MS = 350
