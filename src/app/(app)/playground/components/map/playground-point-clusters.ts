import type MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature, FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, Map, MapLayerMouseEvent } from 'mapbox-gl'

import {
  createPlaygroundClusterLayers,
  createPlaygroundPointSource,
  PLAYGROUND_MAP_IDS,
} from './playground-map-config'

interface PlaygroundPointProperties {
  drawFeatureId: string
  color?: string
}

/**
 * Projects settled Point/MultiPoint features into the native cluster source.
 *
 * @remarks
 * Draw remains the edit model. Selected features are rendered only by Draw, so
 * they do not also participate in clusters. MultiPoint parts retain their parent
 * Draw identity in properties; plain points retain their original GeoJSON ID.
 * Incomplete point geometries are omitted while drawing.
 */
export function getPlaygroundPointCollection(
  features: Feature[],
  selectedIds: string[],
): FeatureCollection<Point, PlaygroundPointProperties> {
  const selected = new Set(selectedIds)
  return {
    type: 'FeatureCollection',
    features: features.flatMap((feature) => {
      if (feature.id === undefined || selected.has(String(feature.id)))
        return []
      const { geometry } = feature
      if (geometry.type !== 'Point' && geometry.type !== 'MultiPoint') return []
      const coordinates =
        geometry.type === 'Point'
          ? [geometry.coordinates]
          : geometry.coordinates
      return coordinates.flatMap((position, index) => {
        if (!Number.isFinite(position[0]) || !Number.isFinite(position[1]))
          return []
        return [
          {
            type: 'Feature' as const,
            id:
              geometry.type === 'Point'
                ? feature.id
                : `${feature.id}:point:${index}`,
            properties: {
              ...feature.properties,
              drawFeatureId: String(feature.id),
            },
            geometry: { type: 'Point' as const, coordinates: [...position] },
          },
        ]
      })
    }),
  }
}

/**
 * Updates a stored color through Draw's public API, preserving ID and geometry.
 *
 * @remarks
 * In Draw 1.5.0 setFeatureProperty marks data dirty without scheduling a render.
 * Re-adding that same feature through the public API flushes the property change;
 * the draw.render listener then synchronizes silent programmatic updates too.
 * @returns False when the feature no longer exists, otherwise true.
 */
export function setPlaygroundFeatureColor(
  draw: MapboxDraw,
  id: string,
  color: string,
): boolean {
  if (!draw.get(id)) return false
  draw.setFeatureProperty(id, 'color', color)
  const updated = draw.get(id)
  if (updated) draw.add(updated)
  return true
}

/**
 * Connects a loaded Mapbox map to its Draw model using public source/control APIs.
 *
 * @remarks
 * draw.render covers user edits and silent add/set/delete/selection API calls.
 * Unchanged point snapshots do not trigger another GeoJSON worker update. Native
 * point/cluster clicks are disabled while drawing or editing another geometry.
 * No Supercluster instance or dependency on Draw's internal theme IDs is created.
 *
 * @param map - Loaded map; attach its Draw control before calling this once.
 * @param draw - Source of truth for geometry, selection and application properties.
 * @param onSelection - Receives the first selected Draw feature, or null, for the color editor.
 * @returns Explicit sync and listener cleanup. The owner still calls map.remove().
 */
export function connectPlaygroundPointClusters(
  map: Map,
  draw: MapboxDraw,
  onSelection: (feature: Feature | null) => void,
) {
  map.addSource(PLAYGROUND_MAP_IDS.pointSource, createPlaygroundPointSource())
  createPlaygroundClusterLayers().forEach((layer) => map.addLayer(layer))
  const source = map.getSource<GeoJSONSource>(PLAYGROUND_MAP_IDS.pointSource)
  let disposed = false
  let interactive = false
  let previousSnapshot: string | undefined
  let selectionAtPointerDown: string[] | null = null

  // Draw handles mouseup before Mapbox's delegated click and cannot hit our source.
  // Preserve the pre-click selection so Shift-click can still add a native leaf.
  const captureSelection = () => {
    selectionAtPointerDown = draw.getSelectedIds()
  }

  const onPointClick = (event: MapLayerMouseEvent) => {
    if (disposed || draw.getMode() !== 'simple_select') return
    const id = event.features?.[0]?.properties?.drawFeatureId
    if (typeof id !== 'string' || !draw.get(id)) return
    const previousIds = selectionAtPointerDown ?? draw.getSelectedIds()
    selectionAtPointerDown = null
    const featureIds = event.originalEvent?.shiftKey
      ? Array.from(new Set([...previousIds, id]))
      : [id]
    draw.changeMode('simple_select', { featureIds })
    sync()
  }
  const onClusterClick = (event: MapLayerMouseEvent) => {
    if (disposed || draw.getMode() !== 'simple_select') return
    const feature = event.features?.[0]
    const id = feature?.properties?.cluster_id
    if (!feature || feature.geometry.type !== 'Point' || id === undefined)
      return
    const clusterId = Number(id)
    if (!Number.isFinite(clusterId)) return
    const [longitude, latitude] = feature.geometry.coordinates
    source?.getClusterExpansionZoom(clusterId, (error, zoom) => {
      if (disposed || error || zoom == null) return
      map.easeTo({ center: [longitude, latitude], zoom })
    })
  }

  function toggleInteraction(enabled: boolean) {
    if (enabled === interactive) return
    interactive = enabled
    if (enabled) {
      map.on('click', PLAYGROUND_MAP_IDS.unclusteredPoints, onPointClick)
      map.on('click', PLAYGROUND_MAP_IDS.clusters, onClusterClick)
    } else {
      map.off('click', PLAYGROUND_MAP_IDS.unclusteredPoints, onPointClick)
      map.off('click', PLAYGROUND_MAP_IDS.clusters, onClusterClick)
    }
  }

  /** Reconciles public Draw state after a render or an explicitly owned API mutation. */
  function sync() {
    if (disposed) return
    toggleInteraction(draw.getMode() === 'simple_select')
    onSelection(draw.getSelected().features[0] ?? null)
    const points = getPlaygroundPointCollection(
      draw.getAll().features,
      draw.getSelectedIds(),
    )
    const snapshot = JSON.stringify(points)
    if (snapshot === previousSnapshot) return
    previousSnapshot = snapshot
    source?.setData(points)
  }

  map.on('draw.render', sync)
  map.on('mousedown', captureSelection)
  sync()
  return {
    sync,
    dispose() {
      disposed = true
      toggleInteraction(false)
      map.off('draw.render', sync)
      map.off('mousedown', captureSelection)
    },
  }
}
