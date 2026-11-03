import type {
  BusStop,
  Camera,
  CollectionPoint,
  FogoCruzadoIncident,
  School,
} from '@/models/entities'

import {
  getCameraOrigin,
  getCollectionPointOrigin,
} from './collection-point-origin'
import type { ClusterablePoint } from './point-clustering'
import { POINT_LAYER_IDS, type PointLayerId } from './point-layer-config'

export interface PointSourceAdapter<T> {
  getId: (point: T) => string | number
  getCoordinates: (point: T) => [number, number]
  getOrigin: (point: T) => string
}

export interface PreparedPointSource {
  layerId: PointLayerId
  points: readonly ClusterablePoint[]
}

export interface VisiblePointSource extends PreparedPointSource {
  visible: boolean
}

/**
 * Adapts a typed domain source before layers are rendered, preserving object identity.
 *
 * @param layerId - Registered individual-point layer receiving these source objects.
 * @param data - Immutable query data; replace its reference when records change.
 * @param adapter - Explicit identity, longitude/latitude (degrees) and origin accessors.
 * @returns Prepared points with IDs namespaced by layer. Memoize this result by data;
 * visibility and presentation changes must not recreate the points array.
 */
export function preparePointSource<T>(
  layerId: PointLayerId,
  data: readonly T[] | undefined,
  adapter: PointSourceAdapter<T>,
): PreparedPointSource {
  return {
    layerId,
    points: (data ?? []).map((point) => ({
      id: `${layerId}:${adapter.getId(point)}`,
      coordinates: adapter.getCoordinates(point),
      origin: adapter.getOrigin(point),
      point,
    })),
  }
}

const collectionPointAdapter: PointSourceAdapter<CollectionPoint> = {
  getId: (point) => point.cetRioCode,
  getCoordinates: (point) => [point.longitude, point.latitude],
  getOrigin: (point) => getCollectionPointOrigin(point.company),
}

const cameraAdapter: PointSourceAdapter<Camera> = {
  getId: (point) => point.code,
  getCoordinates: (point) => [point.longitude, point.latitude],
  getOrigin: (point) => getCameraOrigin(point.sistemaOrigem),
}

export const incidentAdapter: PointSourceAdapter<FogoCruzadoIncident> = {
  getId: (point) => point.id,
  getCoordinates: (point) => [point.longitude, point.latitude],
  getOrigin: () => 'Fogo Cruzado',
}

export const schoolAdapter: PointSourceAdapter<School> = {
  getId: (point) => point.objectid,
  getCoordinates: (point) => [point.longitude, point.latitude],
  getOrigin: () => 'Escolas',
}

export const busStopAdapter: PointSourceAdapter<BusStop> = {
  getId: (point) => point.id_parada,
  getCoordinates: (point) => [point.longitude, point.latitude],
  getOrigin: () => 'Pontos de ônibus',
}

/** Prepares LPR origins as one category while retaining their individual rendering order. */
export function createCollectionPointSources(
  data: readonly CollectionPoint[] = [],
) {
  return [
    preparePointSource(
      POINT_LAYER_IDS.radars,
      data.filter(
        (point) => getCollectionPointOrigin(point.company) !== 'CIVITAS',
      ),
      collectionPointAdapter,
    ),
    preparePointSource(
      POINT_LAYER_IDS.radarsSentry,
      data.filter(
        (point) => getCollectionPointOrigin(point.company) === 'CIVITAS',
      ),
      collectionPointAdapter,
    ),
  ]
}

/** Prepares camera systems using the same canonical DC3 split as their icon layers. */
export function createCameraSources(data: readonly Camera[] = []) {
  return [
    preparePointSource(
      POINT_LAYER_IDS.cameras,
      data.filter((point) => getCameraOrigin(point.sistemaOrigem) !== 'DC3'),
      cameraAdapter,
    ),
    preparePointSource(
      POINT_LAYER_IDS.camerasDc3,
      data.filter((point) => getCameraOrigin(point.sistemaOrigem) === 'DC3'),
      cameraAdapter,
    ),
  ]
}
