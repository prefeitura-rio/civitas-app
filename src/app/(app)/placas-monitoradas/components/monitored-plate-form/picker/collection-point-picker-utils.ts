import { type MapViewState, WebMercatorViewport } from '@deck.gl/core'

import type { Option } from '@/components/custom/multiselect-with-search'
import type { CollectionPoint } from '@/models/entities'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

const PICKER_MAP_WIDTH = 720
const PICKER_MAP_HEIGHT = 620

export function sortCollectionPoints(points: CollectionPoint[] | undefined) {
  if (!points?.length) return []

  return [...points].sort((a, b) => {
    const districtCompare = (a.district ?? '').localeCompare(
      b.district ?? '',
      'pt-BR',
      { sensitivity: 'base' },
    )

    if (districtCompare !== 0) return districtCompare

    const locationCompare = (a.location ?? '').localeCompare(
      b.location ?? '',
      'pt-BR',
      { sensitivity: 'base' },
    )

    if (locationCompare !== 0) return locationCompare

    return a.cetRioCode.localeCompare(b.cetRioCode, 'pt-BR', {
      sensitivity: 'base',
    })
  })
}

export function buildOptionsFromCollectionPoints(
  points:
    | {
        cetRioCode: string
        location: string | null
      }[]
    | undefined,
): Option[] {
  if (!points?.length) return []

  return points.map((point) => ({
    value: point.cetRioCode,
    label:
      [point.cetRioCode, point.location].filter(Boolean).join(' - ') ||
      point.cetRioCode,
  }))
}

export function buildPointMeta(point: CollectionPoint | undefined) {
  if (!point) return [] as string[]

  return [point.district, point.direction, point.lane].filter(
    (value): value is string => Boolean(value),
  )
}

export function isPointVisibleInViewport(
  point: CollectionPoint,
  bounds: { west: number; south: number; east: number; north: number },
): boolean {
  return (
    point.longitude >= bounds.west &&
    point.longitude <= bounds.east &&
    point.latitude >= bounds.south &&
    point.latitude <= bounds.north
  )
}

export function optionsFromCollectionPointIds(
  ids: string[] | undefined,
  options: Option[],
): Option[] {
  if (!ids?.length) return []

  const byValue = new Map(options.map((option) => [option.value, option]))

  return ids.map((id) => byValue.get(id) ?? { value: id, label: `Ponto ${id}` })
}

export function isFullCollectionPointSelection(
  ids: string[],
  options: Option[],
): boolean {
  if (!options.length || !ids.length) return false
  if (ids.length !== options.length) return false

  const set = new Set(ids)

  return options.every((option) => set.has(option.value))
}

export function getMapViewport(
  points: CollectionPoint[],
  mapWidth = PICKER_MAP_WIDTH,
  mapHeight = PICKER_MAP_HEIGHT,
): MapViewState {
  if (!points.length) return { ...INITIAL_VIEW_PORT, pitch: 0, bearing: 0 }

  if (points.length === 1) {
    return {
      longitude: points[0].longitude,
      latitude: points[0].latitude,
      zoom: 14,
      pitch: 0,
      bearing: 0,
    }
  }

  const longitudes = points.map((point) => point.longitude)
  const latitudes = points.map((point) => point.latitude)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)

  const viewport = new WebMercatorViewport({
    width: mapWidth,
    height: mapHeight,
  }).fitBounds(
    [
      [minLongitude, minLatitude],
      [maxLongitude, maxLatitude],
    ],
    {
      padding: { top: 72, right: 96, bottom: 72, left: 72 },
    },
  )

  return {
    longitude: viewport.longitude,
    latitude: viewport.latitude,
    zoom: Math.min(viewport.zoom, 15.25),
    pitch: 0,
    bearing: 0,
  }
}
