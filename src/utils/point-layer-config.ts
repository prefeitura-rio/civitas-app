import { ScatterplotLayer } from '@deck.gl/layers'

import { POINT_CLUSTER_COLORS } from './point-cluster-colors'

export const POINT_LAYER_IDS = {
  radars: 'radars',
  cameras: 'cameras',
  incidents: 'fogocruzado-incidents',
  schools: 'schools',
  busStops: 'BusStops',
} as const

export type PointLayerId =
  (typeof POINT_LAYER_IDS)[keyof typeof POINT_LAYER_IDS]

export const POINT_CLUSTER_GROUPS = [
  {
    id: 'lpr',
    layerIds: [POINT_LAYER_IDS.radars],
    color: POINT_CLUSTER_COLORS.lpr,
  },
  {
    id: 'cameras',
    layerIds: [POINT_LAYER_IDS.cameras],
    color: POINT_CLUSTER_COLORS.cameras,
  },
  {
    id: 'incidents',
    layerIds: [POINT_LAYER_IDS.incidents],
    color: POINT_CLUSTER_COLORS.incidents,
  },
  {
    id: 'schools',
    layerIds: [POINT_LAYER_IDS.schools],
    color: POINT_CLUSTER_COLORS.schools,
  },
  {
    id: 'bus-stops',
    layerIds: [POINT_LAYER_IDS.busStops],
    color: POINT_CLUSTER_COLORS.busStops,
  },
] as const

export type PointClusterGroupId = (typeof POINT_CLUSTER_GROUPS)[number]['id']

/** Shared namespace for the circle and label layers belonging to a point category. */
export function getPointClusterLayerPrefix(groupId: PointClusterGroupId) {
  return `point-clusters-${groupId}`
}

const clusterLayerIds = new Set(
  POINT_CLUSTER_GROUPS.flatMap(({ id }) => [
    `${getPointClusterLayerPrefix(id)}-circles`,
    `${getPointClusterLayerPrefix(id)}-counts`,
  ]),
)

/** Recognizes registered cluster sublayers without inferring identity from a prefix. */
export function isPointClusterLayerId(layerId: string) {
  return clusterLayerIds.has(layerId)
}

/** Identifies a point category using the same registry as rendering and clustering. */
export function isPointLayerInGroup(
  layerId: string,
  groupId: PointClusterGroupId,
) {
  return POINT_CLUSTER_GROUPS.some(
    (group) =>
      group.id === groupId && group.layerIds.some((id) => id === layerId),
  )
}

/**
 * Creates a non-interactive red circle highlight layer around a right-clicked equipment point.
 *
 * @param id - Unique Deck.gl layer identifier.
 * @param position - `[longitude, latitude]` in degrees of the inspected equipment, or `null` when none is active.
 * @param visible - Whether the parent equipment layer is visible. Defaults to `true`.
 * @returns A `ScatterplotLayer` rendering a red circle around the 24px icon, or `null` when inactive.
 */
export function createRightClickRingLayer(
  id: string,
  position: [number, number] | null,
  visible = true,
) {
  if (!position || !visible) return null

  return new ScatterplotLayer<[number, number]>({
    id,
    data: [position],
    pickable: false,
    radiusUnits: 'pixels',
    getPosition: (point) => point,
    getRadius: 18,
    radiusMinPixels: 18,
    radiusMaxPixels: 18,
    stroked: true,
    filled: true,
    getFillColor: [239, 68, 68, 36],
    getLineColor: [239, 68, 68, 255],
    getLineWidth: 2.5,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 2.5,
  })
}
