import { POINT_CLUSTER_COLORS } from './point-cluster-colors'

export const POINT_LAYER_IDS = {
  radars: 'radars',
  radarsSentry: 'radars-sentry',
  cameras: 'cameras',
  camerasDc3: 'cameras-dc3',
  incidents: 'fogocruzado-incidents',
  schools: 'schools',
  busStops: 'BusStops',
} as const

export type PointLayerId =
  (typeof POINT_LAYER_IDS)[keyof typeof POINT_LAYER_IDS]

export const POINT_CLUSTER_GROUPS = [
  {
    id: 'lpr',
    layerIds: [POINT_LAYER_IDS.radars, POINT_LAYER_IDS.radarsSentry],
    color: POINT_CLUSTER_COLORS.lpr,
  },
  {
    id: 'cameras',
    layerIds: [POINT_LAYER_IDS.cameras, POINT_LAYER_IDS.camerasDc3],
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
