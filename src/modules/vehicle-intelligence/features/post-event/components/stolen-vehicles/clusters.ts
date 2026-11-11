import { markerScale } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import {
  modalityName,
  PRIMARY,
  SECONDARY,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type {
  ClusterConnection,
  LocationHotspot,
  OriginCluster,
  PostEventOrigin,
} from '@/modules/vehicle-intelligence/features/post-event/types'

/** O mapa só liga polos com pelo menos esse número de ocorrências em comum. */
export const RECURRENT_CONNECTION_MINIMUM_OCCURRENCES = 2

export function isRecurringConnection(connection: ClusterConnection): boolean {
  return connection.occurrences >= RECURRENT_CONNECTION_MINIMUM_OCCURRENCES
}

/** Espessura e opacidade da linha de conexão, pela contagem em relação à maior do polo aberto. */
export function clusterConnectionWeight(
  occurrences: number,
  maximum: number,
): number {
  return 1.25 + 6 * markerScale(occurrences, maximum)
}

export function clusterConnectionOpacity(
  occurrences: number,
  maximum: number,
): number {
  return 0.24 + 0.58 * markerScale(occurrences, maximum)
}

/** Uma barra de porcentagem dos popups. */
export type BreakdownItem = { key: string; label: string; percentage: number }

/** Porcentagem (uma casa) de cada valor; vazio conta como "Não informado". Do maior para o menor. */
export function percentageBreakdown(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>()
  values.forEach((value) => {
    const label = value?.trim() || 'Não informado'
    counts.set(label, (counts.get(label) || 0) + 1)
  })
  const total = Math.max(values.length, 1)
  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: key,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort(
      (left, right) =>
        right.percentage - left.percentage ||
        left.label.localeCompare(right.label),
    )
}

/** Um endereço do polo de origem: as ocorrências com a mesma coordenada do fato. */
export type OriginClusterPoint = {
  key: string
  latitude: number
  longitude: number
  address: string
  occurrences: number
  vehicles: number
  cispCount: number
  events: PostEventOrigin[]
}

/** Os pontos do polo de origem (sem coordenada do fato fica de fora), dos com mais ocorrências. */
export function originClusterPoints(
  cluster: OriginCluster,
): OriginClusterPoint[] {
  const grouped = new Map<string, PostEventOrigin[]>()
  cluster.events.forEach((event) => {
    if (event.event_latitude == null || event.event_longitude == null) return
    const key = `${event.event_latitude.toFixed(6)}:${event.event_longitude.toFixed(6)}`
    grouped.set(key, [...(grouped.get(key) || []), event])
  })
  return Array.from(grouped.entries())
    .map(([key, events]) => ({
      key,
      latitude: Number(events[0].event_latitude),
      longitude: Number(events[0].event_longitude),
      address:
        events.find((event) => event.event_address)?.event_address ||
        'Endereço não informado',
      occurrences: events.length,
      vehicles: new Set(events.map((event) => event.plate).filter(Boolean))
        .size,
      cispCount: new Set(events.map((event) => event.cisp).filter(Boolean))
        .size,
      events,
    }))
    .sort(
      (left, right) =>
        right.occurrences - left.occurrences ||
        left.address.localeCompare(right.address),
    )
}

/** As `limit` primeiras CISPs, com "CISP" antes do código. */
export function topCispItems(
  breakdown: BreakdownItem[],
  limit: number,
): BreakdownItem[] {
  return breakdown.slice(0, limit).map((item) => ({
    ...item,
    label: item.key === 'Não informado' ? item.label : `CISP ${item.label}`,
  }))
}

/** Carga: "12 veículo + carga · 3 carga subtraída" (desconexões por categoria); nulo fora da carga. */
export function categoryCountsLine(
  counts: LocationHotspot['category_counts'],
): string | null {
  return counts
    ? [PRIMARY, SECONDARY]
        .map((modality) => `${counts[modality] ?? 0} ${modalityName(modality)}`)
        .join(' · ')
    : null
}
