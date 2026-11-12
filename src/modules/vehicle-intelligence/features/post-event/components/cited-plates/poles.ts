import type { MapObstacle } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { markerScale } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type {
  DestinationPole,
  OriginPole,
  OriginPoleEvent,
  PoleConnection,
  PostEventData,
} from '@/modules/vehicle-intelligence/features/post-event/types'

export type LatLng = [number, number]

/** "roubo", "furto" (a modalidade em minúsculas, para o meio da frase). */
export function modalityLabel(modality: string): string {
  return modality === 'ROUBO'
    ? 'roubo'
    : modality === 'FURTO'
      ? 'furto'
      : modality.toLocaleLowerCase('pt-BR')
}

/** Visão geral sem os extremos: 5% de cada lado em latitude e longitude. */
export function trimmedBounds(points: LatLng[]): LatLng[] {
  if (points.length < 10) return points
  const latitudes = points.map((point) => point[0]).sort((a, b) => a - b)
  const longitudes = points.map((point) => point[1]).sort((a, b) => a - b)
  const low = Math.floor(points.length * 0.05)
  const high = Math.ceil(points.length * 0.95) - 1
  return [
    [latitudes[low], longitudes[low]],
    [latitudes[high], longitudes[high]],
  ]
}

/** "CISP 014" nas barras de CISP; "Não informado" fica como está. */
export const cispBreakdownLabel = (value: string) =>
  value === 'Não informado' ? value : `CISP ${value}`

/** Um endereço do polo de origem: as ocorrências com a mesma coordenada e as placas citadas que passaram ali. */
export type OriginPoint = {
  key: string
  latitude: number
  longitude: number
  address: string
  events: OriginPoleEvent[]
  plates: string[]
}

/** Os pontos do polo de origem, dos com mais ocorrências. */
export function originPoints(pole: OriginPole): OriginPoint[] {
  const grouped = new Map<string, OriginPoleEvent[]>()
  pole.events.forEach((event) => {
    const key = `${event.latitude.toFixed(6)}:${event.longitude.toFixed(6)}`
    grouped.set(key, [...(grouped.get(key) || []), event])
  })
  return [...grouped.entries()]
    .map(([key, events]) => ({
      key,
      latitude: events[0].latitude,
      longitude: events[0].longitude,
      address:
        events.find((event) => event.address)?.address ||
        'Endereço não informado',
      events,
      plates: [...new Set(events.flatMap((event) => event.plates))].sort(),
    }))
    .sort((left, right) => right.events.length - left.events.length)
}

/** As ligações do polo aberto (nenhuma sem polo aberto). */
export function connectionsOfPole(
  connections: PoleConnection[],
  origin: OriginPole | null,
  destination: DestinationPole | null,
): PoleConnection[] {
  return connections.filter((connection) =>
    origin
      ? connection.origin_id === origin.id
      : destination
        ? connection.destination_id === destination.id
        : false,
  )
}

/** O que o mapa enquadra: o polo aberto com as pontas das ligações, ou a visão geral dos polos com placa citada. */
export function explorerViewport(
  data: Pick<PostEventData, 'origin_poles' | 'destination_poles'>,
  selection: {
    origin: OriginPole | null
    destination: DestinationPole | null
    points: OriginPoint[]
    connections: PoleConnection[]
  },
): LatLng[] {
  const { origin, destination, points, connections } = selection
  if (origin)
    return [
      ...points.map((point) => [point.latitude, point.longitude] as LatLng),
      ...connections.map(
        (connection) =>
          [
            connection.destination_latitude,
            connection.destination_longitude,
          ] as LatLng,
      ),
    ]
  if (destination)
    return [
      ...destination.radars.map(
        (radar) => [radar.latitude, radar.longitude] as LatLng,
      ),
      ...connections.map(
        (connection) =>
          [connection.origin_latitude, connection.origin_longitude] as LatLng,
      ),
    ]
  return trimmedBounds([
    ...data.destination_poles.map(
      (pole) => [pole.latitude, pole.longitude] as LatLng,
    ),
    ...data.origin_poles
      .filter((pole) => pole.tracked_occurrences > 0)
      .map((pole) => [pole.latitude, pole.longitude] as LatLng),
  ])
}

/** Os círculos dos polos, para os nomes de território desviarem deles. */
export function poleObstacles(
  origins: OriginPole[],
  destinations: DestinationPole[],
  originMax: number,
  destinationMax: number,
): MapObstacle[] {
  return [
    ...origins.map((pole) => ({
      lat: pole.latitude,
      lng: pole.longitude,
      radius:
        (pole.tracked_occurrences > 0 ? 6 : 4) +
        16 * markerScale(pole.occurrences, originMax),
    })),
    ...destinations.map((pole) => ({
      lat: pole.latitude,
      lng: pole.longitude,
      radius: 7 + 18 * markerScale(pole.occurrences, destinationMax),
    })),
  ]
}
