'use client'

import type { Layer, LayersList, MapViewState } from '@deck.gl/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import { POINT_CLUSTER_COLORS } from '@/utils/point-cluster-colors'
import {
  type ClusterablePoint,
  type ClusterFeature,
  createClusterLayers,
  createPointClusterIndex,
  getClusterOriginCounts,
  getMapBounds,
} from '@/utils/point-clustering'

type GenericPoint = {
  id?: string | number
  code?: string | number
  cetRioCode?: string
  latitude?: number
  longitude?: number
  from?: [number, number]
  company?: string | null
  sistemaOrigem?: string
  origem_equipamento?: string
  index?: number
}

function getCoordinates(point: GenericPoint): [number, number] | null {
  if (point.from && point.from.length >= 2) return point.from
  if (Number.isFinite(point.longitude) && Number.isFinite(point.latitude)) {
    return [point.longitude as number, point.latitude as number]
  }
  return null
}

function pointId(point: GenericPoint, index: number) {
  return String(
    point.id ?? point.code ?? point.cetRioCode ?? point.index ?? index,
  )
}

function getLayerPoints(layer: Layer): GenericPoint[] {
  return Array.isArray(layer.props.data)
    ? (layer.props.data as GenericPoint[])
    : []
}

function getOrigin(point: GenericPoint, fallback: string) {
  return (
    point.company?.trim() ||
    point.sistemaOrigem?.trim() ||
    point.origem_equipamento?.trim() ||
    fallback
  )
}

export function useClusteredMapLayers(
  baseLayers: LayersList,
  viewport: MapViewState,
  size: { width: number; height: number },
  setViewport: (viewport: MapViewState) => void,
) {
  const [hoveredCluster, setHoveredCluster] =
    useState<ClusterFeature<GenericPoint> | null>(null)
  useEffect(() => {
    setHoveredCluster(null)
  }, [viewport])
  const indexCache = useRef(
    new Map<
      string,
      {
        sourceData: unknown[][]
        index: ReturnType<typeof createPointClusterIndex<GenericPoint>>
      }
    >(),
  )
  const bounds = useMemo(
    () => getMapBounds(viewport, size.width || 720, size.height || 620),
    [size.height, size.width, viewport],
  )
  const zoom = Math.max(0, Math.floor(viewport.zoom ?? 0))
  const flatLayers = useMemo(() => {
    const flatten = (layers: LayersList): Layer[] =>
      layers.flatMap((layer) => {
        if (!layer) return []
        if (Array.isArray(layer)) return flatten(layer as LayersList)
        return [layer as Layer]
      })

    return flatten(baseLayers)
  }, [baseLayers])

  const groups = useMemo(() => {
    const pointLayerIds = new Set([
      'radars',
      'radars-sentry',
      'cameras',
      'cameras-dc3',
      'fogocruzado-incidents',
      'schools',
      'BusStops',
    ])
    const pointLayers = flatLayers.filter((layer) =>
      pointLayerIds.has(layer.id),
    )
    const byId = new Map(pointLayers.map((layer) => [layer.id, layer]))
    const groupConfigs = [
      {
        id: 'lpr',
        ids: ['radars', 'radars-sentry'],
        origin: 'LPR',
        clusterColor: POINT_CLUSTER_COLORS.lpr,
      },
      {
        id: 'cameras',
        ids: ['cameras', 'cameras-dc3'],
        origin: 'Câmeras',
        clusterColor: POINT_CLUSTER_COLORS.cameras,
      },
      {
        id: 'incidents',
        ids: ['fogocruzado-incidents'],
        origin: 'Fogo Cruzado',
        clusterColor: POINT_CLUSTER_COLORS.incidents,
      },
      {
        id: 'schools',
        ids: ['schools'],
        origin: 'Escolas',
        clusterColor: POINT_CLUSTER_COLORS.schools,
      },
      {
        id: 'bus-stops',
        ids: ['BusStops'],
        origin: 'Pontos de ônibus',
        clusterColor: POINT_CLUSTER_COLORS.busStops,
      },
    ]

    return groupConfigs.map((config) => {
      const layers = config.ids
        .map((id) => byId.get(id))
        .filter((layer): layer is Layer => Boolean(layer))
      const points: ClusterablePoint<GenericPoint>[] = layers.flatMap((layer) =>
        getLayerPoints(layer).flatMap((point, index) => {
          const coordinates = getCoordinates(point)
          if (!coordinates) return []
          return [
            {
              id: `${config.id}:${pointId(point, index)}`,
              coordinates,
              origin: getOrigin(point, config.origin),
              point,
            },
          ]
        }),
      )

      return { ...config, layers, points }
    })
  }, [flatLayers])

  const indexes = useMemo(
    () =>
      groups.map((group) => {
        const sourceData = group.layers.map(
          (layer) => layer.props.data as unknown[],
        )
        const previous = indexCache.current.get(group.id)
        if (
          previous &&
          previous.sourceData.length === sourceData.length &&
          previous.sourceData.every((data, index) => data === sourceData[index])
        ) {
          return previous.index
        }

        const index = createPointClusterIndex(group.points)
        indexCache.current.set(group.id, { sourceData, index })
        return index
      }),
    [groups],
  )

  const clustered = useMemo(() => {
    const clusterLayers: LayersList = []
    const replacements = new Map<string, Layer>()

    groups.forEach((group, groupIndex) => {
      if (!group.layers.length) return
      const index = indexes[groupIndex]
      const features = index.getClusters(
        bounds,
        zoom,
      ) as ClusterFeature<GenericPoint>[]
      const leaves = features
        .filter(
          (feature) => feature.properties && !('cluster' in feature.properties),
        )
        .map((feature) => (feature.properties as { point: GenericPoint }).point)
      const leafSet = new Set(leaves)

      group.layers.forEach((layer) => {
        const visiblePoints = getLayerPoints(layer).filter((point) =>
          leafSet.has(point),
        )
        replacements.set(layer.id, layer.clone({ data: visiblePoints }))
      })

      if (
        !features.some(
          (feature) => feature.properties && 'cluster' in feature.properties,
        )
      ) {
        return
      }

      const visible = group.layers.some(
        (layer) => layer.props.visible !== false,
      )
      const onClick = (feature: ClusterFeature<GenericPoint>) => {
        if (!feature.properties || !('cluster_id' in feature.properties)) return
        setHoveredCluster(null)
        const expansionZoom = index.getClusterExpansionZoom(
          feature.properties.cluster_id,
        )
        setViewport({
          ...viewport,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
          zoom: Math.max(viewport.zoom ?? 0, expansionZoom),
          transitionDuration: 350,
        })
      }
      const [circles, labels] = createClusterLayers(
        `point-clusters-${group.id}`,
        features,
        onClick,
        (feature) => setHoveredCluster(feature),
        group.clusterColor,
      )
      clusterLayers.push(circles.clone({ visible }), labels.clone({ visible }))
    })

    return {
      layers: flatLayers.map((layer) => replacements.get(layer.id) ?? layer),
      clusterLayers,
    }
  }, [bounds, flatLayers, groups, indexes, setViewport, viewport, zoom])

  return {
    layers: [...clustered.layers, ...clustered.clusterLayers],
    hoveredCluster,
    clearHoveredCluster: () => setHoveredCluster(null),
    hoveredOriginCounts: hoveredCluster
      ? getClusterOriginCounts(hoveredCluster)
      : {},
  }
}
