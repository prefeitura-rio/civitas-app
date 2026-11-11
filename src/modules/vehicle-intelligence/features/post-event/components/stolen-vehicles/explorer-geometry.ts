import type { MapObstacle } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { markerScale } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { OriginClusterPoint } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import type {
  ClusterConnection,
  DestinationCluster,
  LocationHotspot,
  MasterPostData,
} from '@/modules/vehicle-intelligence/features/post-event/types'

type LatLng = [number, number]

/** As três listas de polos desenhados: origem, desconexão (vários radares) e radar terminal. */
type PoleSets = Pick<
  MasterPostData,
  'origin_clusters' | 'destination_clusters' | 'destination_hubs'
>

/** O maior número de ocorrências entre todos os polos do mapa (a escala dos círculos). */
export function poleMaximumOf(poles: PoleSets): number {
  return Math.max(
    ...poles.destination_clusters.map((item) => item.occurrences),
    ...poles.destination_hubs.map((item) => item.occurrences),
    ...poles.origin_clusters.map((item) => item.occurrences),
    1,
  )
}

/** As conexões recorrentes do polo aberto (nenhuma sem polo aberto). */
export function connectionsOfSelection(
  connections: ClusterConnection[],
  originId: string | null,
  destinationId: number | null,
  terminalPointId: string | null,
): ClusterConnection[] {
  return connections.filter((connection) =>
    originId
      ? connection.origin_cluster_id === originId
      : destinationId != null
        ? connection.destination_cluster_id === destinationId
        : terminalPointId
          ? connection.destination_hub_id === terminalPointId
          : false,
  )
}

/** O que o mapa enquadra: o polo aberto com as pontas das conexões dele, ou todos os polos. */
export function viewportPointsOf(
  poles: PoleSets,
  selection: {
    terminal: LocationHotspot | null
    originPoints: OriginClusterPoint[]
    destination: DestinationCluster | null
    connections: ClusterConnection[]
  },
): LatLng[] {
  const { terminal, originPoints, destination, connections } = selection
  if (terminal) {
    return [
      [terminal.latitude, terminal.longitude],
      ...connections.map(
        (connection) =>
          [connection.origin_latitude, connection.origin_longitude] as LatLng,
      ),
    ]
  }
  if (originPoints.length) {
    return [
      ...originPoints.map(
        (point) => [point.latitude, point.longitude] as LatLng,
      ),
      ...connections.map(
        (connection) =>
          [
            connection.destination_latitude,
            connection.destination_longitude,
          ] as LatLng,
      ),
    ]
  }
  if (destination) {
    return [
      ...(destination.destinations.length
        ? destination.destinations.map(
            (point) => [point.latitude, point.longitude] as LatLng,
          )
        : [[destination.latitude, destination.longitude] as LatLng]),
      ...connections.map(
        (connection) =>
          [connection.origin_latitude, connection.origin_longitude] as LatLng,
      ),
    ]
  }
  return [
    ...poles.origin_clusters.map(
      (cluster) => [cluster.latitude, cluster.longitude] as LatLng,
    ),
    ...poles.destination_clusters.map(
      (cluster) => [cluster.latitude, cluster.longitude] as LatLng,
    ),
    ...poles.destination_hubs.map(
      (point) => [point.latitude, point.longitude] as LatLng,
    ),
  ]
}

/** Os círculos dos polos, para os nomes de território desviarem deles. */
export function poleObstacles(
  poles: PoleSets,
  poleMaximum: number,
): MapObstacle[] {
  return [
    ...poles.destination_clusters.map((item) => ({
      lat: item.latitude,
      lng: item.longitude,
      radius: 6 + 20 * markerScale(item.occurrences, poleMaximum),
    })),
    ...poles.destination_hubs.map((item) => ({
      lat: item.latitude,
      lng: item.longitude,
      radius: 6 + 20 * markerScale(item.occurrences, poleMaximum),
    })),
    ...poles.origin_clusters.map((item) => ({
      lat: item.latitude,
      lng: item.longitude,
      radius: 6 + 20 * markerScale(item.occurrences, poleMaximum),
    })),
  ]
}

/** Porcentagem (uma casa) das ocorrências acompanhadas cuja última leitura cai num polo de desconexão. */
export function destinationPoleCoverage(
  data: Pick<MasterPostData, 'cluster_coverage'> & PoleSets,
): number {
  const destinationCoverageTotal =
    data.cluster_coverage.destination_events_clustered +
    data.cluster_coverage.destination_events_unclustered
  const destinationPoleEvents =
    data.destination_clusters.reduce(
      (total, cluster) => total + cluster.occurrences,
      0,
    ) +
    data.destination_hubs.reduce((total, pole) => total + pole.occurrences, 0)
  return (
    Math.round(
      (1000 * destinationPoleEvents) / Math.max(destinationCoverageTotal, 1),
    ) / 10
  )
}
