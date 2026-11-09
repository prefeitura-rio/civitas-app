'use client'

import type { Color, Layer, LayersList, MapViewState } from '@deck.gl/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  type ClusterFeature,
  type ClusterQueryFeature,
  createClusterLayers,
  createPointClusterIndex,
  getClusterOriginCounts,
  getExpandedClusterViewState,
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
 * @param size - Renderer-reported dimensions in CSS pixels, or null until measured.
 * Spatial queries wait for a positive size instead of assuming fallback dimensions.
 * @param setViewport - Updates the camera when a cluster is expanded.
 * @returns Renderable layers and cluster hover state with aggregated origin counts.
 */
export function useClusteredMapLayers(
  baseLayers: LayersList,
  sources: readonly VisiblePointSource[],
  viewport: MapViewState,
  size: { width: number; height: number } | null,
  setViewport: (viewport: MapViewState) => void,
) {
  const [hoveredCluster, setHoveredCluster] = useState<ClusterFeature | null>(
    null,
  )
  const indexCache = useRef(new Map<PointClusterGroupId, CachedIndex>())
  const width = size?.width ?? 0
  const height = size?.height ?? 0
  const bounds = useMemo(
    () =>
      width > 0 && height > 0 ? getMapBounds(viewport, width, height) : null,
    [height, viewport, width],
  )
  useEffect(() => {
    setHoveredCluster(null)
  }, [bounds, sources])
  const zoom = Math.max(0, Math.floor(viewport.zoom ?? 0))
  const sourceById = useMemo(
    () =>
      new Map<string, VisiblePointSource>(
        sources.map((source) => [source.layerId, source]),
      ),
    [sources],
  )
  const groups = useMemo<QueriedGroup[]>(() => {
    if (!bounds) return []
    return POINT_CLUSTER_GROUPS.map((config) => {
      const activeSources = config.layerIds
        .map((id) => sourceById.get(id))
        .filter((source): source is VisiblePointSource =>
          Boolean(source?.visible && source.points.length),
        )
      if (!activeSources.length) return { ...config, index: null, features: [] }

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
    })
  }, [bounds, sourceById, zoom])
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
          setViewport(getExpandedClusterViewState(viewport, index, feature))
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
