'use client'

import type { Color, Layer, LayersList, MapViewState } from '@deck.gl/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  type ClusterFeature,
  type ClusterQueryFeature,
  createClusterLayers,
  createPointClusterIndex,
  getClusterOriginCounts,
  getMapBounds,
  isClusterFeature,
  isIndexedPointFeature,
  type PointClusterIndex,
} from '@/utils/point-clustering'
import {
  getPointClusterLayerPrefix,
  POINT_CLUSTER_GROUPS,
  type PointClusterGroupId,
} from '@/utils/point-layer-config'
import type {
  PreparedPointSource,
  VisiblePointSource,
} from '@/utils/point-layer-sources'

// Fallback dimensions in pixels when the map size is unavailable.
const FALLBACK_MAP_SIZE_PX = { width: 720, height: 620 }

interface CachedIndex {
  sourcePoints: PreparedPointSource['points'][]
  index: PointClusterIndex
}

interface QueriedGroup {
  id: PointClusterGroupId
  color: Color
  index: PointClusterIndex | null
  features: ClusterQueryFeature[]
}

/**
 * Clusters explicitly adapted point sources, independently of layer presentation.
 *
 * @remarks
 * Only visible, non-empty sources participate. A bounded cache retains the last
 * index for each registered category, including while the whole category is hidden.
 * Stable prepared points prevent hover, selection or camera updates from rebuilding
 * indexes. Other layers, including trip detections, retain their original rendering.
 *
 * @param baseLayers - Rendered Deck.gl layers; their data is not used as spatial input.
 * @param sources - Typed domain data prepared before rendering. Keep points arrays
 * stable until data changes; visibility determines each source's participation.
 * @param viewport - Current camera used for spatial queries and cluster expansion.
 * @param size - Measured dimensions in CSS pixels; zero values use the named fallback.
 * @param setViewport - Updates the camera when a cluster is expanded.
 * @returns Renderable layers and cluster hover state with aggregated origin counts.
 */
export function useClusteredMapLayers(
  baseLayers: LayersList,
  sources: readonly VisiblePointSource[],
  viewport: MapViewState,
  size: { width: number; height: number },
  setViewport: (viewport: MapViewState) => void,
) {
  const [hoveredCluster, setHoveredCluster] = useState<ClusterFeature | null>(
    null,
  )
  useEffect(() => {
    setHoveredCluster(null)
  }, [viewport, sources])
  const indexCache = useRef(new Map<PointClusterGroupId, CachedIndex>())
  const bounds = useMemo(
    () =>
      getMapBounds(
        viewport,
        size.width || FALLBACK_MAP_SIZE_PX.width,
        size.height || FALLBACK_MAP_SIZE_PX.height,
      ),
    [size.height, size.width, viewport],
  )
  const zoom = Math.max(0, Math.floor(viewport.zoom ?? 0))
  const sourceById = useMemo(
    () =>
      new Map<string, VisiblePointSource>(
        sources.map((source) => [source.layerId, source]),
      ),
    [sources],
  )
  const groups = useMemo<QueriedGroup[]>(
    () =>
      POINT_CLUSTER_GROUPS.map((config) => {
        const activeSources = config.layerIds
          .map((id) => sourceById.get(id))
          .filter((source): source is VisiblePointSource =>
            Boolean(source?.visible && source.points.length),
          )
        if (!activeSources.length)
          return { ...config, index: null, features: [] }

        const sourcePoints = activeSources.map((source) => source.points)
        const previous = indexCache.current.get(config.id)
        const unchanged =
          previous &&
          previous.sourcePoints.length === sourcePoints.length &&
          previous.sourcePoints.every(
            (points, index) => points === sourcePoints[index],
          )
        let index = unchanged ? previous.index : null
        if (!index) {
          // Adaptation and point concatenation happen only when spatial input changes.
          index = createPointClusterIndex(
            activeSources.flatMap((source) => source.points),
          )
          indexCache.current.set(config.id, { sourcePoints, index })
        }
        return { ...config, index, features: index.getClusters(bounds, zoom) }
      }),
    [bounds, sourceById, zoom],
  )
  const flatLayers = useMemo(() => {
    const flatten = (layers: LayersList): Layer[] =>
      layers.flatMap((layer) => {
        if (!layer) return []
        return Array.isArray(layer) ? flatten(layer) : [layer]
      })
    return flatten(baseLayers)
  }, [baseLayers])

  const pointDataByLayer = useMemo(() => {
    const leafIds = new Set(
      groups.flatMap((group) =>
        group.features
          .filter(isIndexedPointFeature)
          .map((feature) => feature.id),
      ),
    )
    return new Map<string, unknown[]>(
      sources.map((source) => [
        source.layerId,
        source.visible
          ? source.points
              .filter((point) => leafIds.has(point.id))
              .map((point) => point.point)
          : [],
      ]),
    )
  }, [groups, sources])
  const individualLayers = useMemo(
    () =>
      flatLayers.map((layer) => {
        const source = sourceById.get(layer.id)
        return source
          ? layer.clone({
              data: pointDataByLayer.get(layer.id),
              visible: source.visible,
            })
          : layer
      }),
    [flatLayers, pointDataByLayer, sourceById],
  )
  const clusterLayers = useMemo(() => {
    const clusterLayers: LayersList = []
    groups.forEach((group) => {
      const index = group.index
      if (!index || !group.features.some(isClusterFeature)) return
      const [circles, labels] = createClusterLayers(
        getPointClusterLayerPrefix(group.id),
        group.features,
        (feature) => {
          setHoveredCluster(null)
          setViewport({
            ...viewport,
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
            zoom: Math.max(
              viewport.zoom ?? 0,
              index.getClusterExpansionZoom(feature.properties.cluster_id),
            ),
            transitionDuration: 350,
          })
        },
        setHoveredCluster,
        group.color,
      )
      clusterLayers.push(circles, labels)
    })
    return clusterLayers
  }, [groups, setViewport, viewport])
  const layers = useMemo(
    () => [...individualLayers, ...clusterLayers],
    [individualLayers, clusterLayers],
  )

  return {
    layers,
    hoveredCluster,
    clearHoveredCluster: () => setHoveredCluster(null),
    hoveredOriginCounts: hoveredCluster
      ? getClusterOriginCounts(hoveredCluster)
      : {},
  }
}
