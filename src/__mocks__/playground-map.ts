import type MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { FeatureCollection } from 'geojson'
import type { LayerSpecification, Map as MapboxMap } from 'mapbox-gl'

type Handler = (event: Record<string, unknown>) => void

function interaction() {
  let enabled = true
  return {
    isEnabled: () => enabled,
    enable: () => {
      enabled = true
    },
    disable: () => {
      enabled = false
    },
  }
}

export class PlaygroundSourceStub {
  type = 'geojson' as const
  data: FeatureCollection = { type: 'FeatureCollection', features: [] }
  setData = jest.fn((data: FeatureCollection) => {
    this.data = data
    return this
  })

  getClusterExpansionZoom = jest.fn(
    (_id: number, callback: (error: Error | null, zoom?: number) => void) =>
      callback(null, 17),
  )
}

/** Public Mapbox boundary for real Draw API tests; no WebGL or Mapbox worker runs here. */
export class PlaygroundMapStub {
  container = document.createElement('div')
  sources = new Map<string, PlaygroundSourceStub>()
  layers = new Map<string, LayerSpecification>()
  controls: MapboxDraw[] = []
  listeners = new Map<string, Set<Handler>>()
  delegated = new Map<string, Set<Handler>>()
  dragPan = interaction()
  boxZoom = interaction()
  doubleClickZoom = interaction()
  scrollZoom = interaction()
  dragRotate = interaction()
  keyboard = interaction()
  touchZoomRotate = interaction()
  easeTo = jest.fn()
  setFilter = jest.fn()
  setPaintProperty = jest.fn()
  queryRenderedFeatures = jest.fn(() => [])
  on = jest.fn(
    (type: string, layerOrHandler: string | Handler, handler?: Handler) => {
      const entries = handler ? this.delegated : this.listeners
      const key = handler ? `${type}:${layerOrHandler}` : type
      const callbacks = entries.get(key) ?? new Set<Handler>()
      callbacks.add(handler ?? (layerOrHandler as Handler))
      entries.set(key, callbacks)
      return this
    },
  )

  off = jest.fn(
    (type: string, layerOrHandler: string | Handler, handler?: Handler) => {
      const entries = handler ? this.delegated : this.listeners
      entries
        .get(handler ? `${type}:${layerOrHandler}` : type)
        ?.delete(handler ?? (layerOrHandler as Handler))
      return this
    },
  )

  fire(type: string, event: object = {}) {
    for (const handler of [...(this.listeners.get(type) ?? [])])
      handler({ type, target: this, ...event })
    return this
  }

  fireLayer(type: string, layerId: string, event: object) {
    for (const handler of [...(this.delegated.get(`${type}:${layerId}`) ?? [])])
      handler({ type, target: this, ...event })
  }

  loaded() {
    return true
  }

  getContainer() {
    return this.container
  }

  getCanvas() {
    return this.container
  }

  getZoom() {
    return 12
  }

  getProjection() {
    return { name: 'mercator' }
  }

  getCenter() {
    return { lng: -43.2, lat: -22.9 }
  }

  project(coordinates: number[]) {
    return { x: coordinates[0], y: coordinates[1] }
  }

  unproject(point: { x: number; y: number }) {
    return { lng: point.x, lat: point.y }
  }

  addSource(id: string) {
    this.sources.set(id, new PlaygroundSourceStub())
    return this
  }

  getSource(id: string) {
    return this.sources.get(id)
  }

  removeSource(id: string) {
    this.sources.delete(id)
    return this
  }

  addLayer(layer: LayerSpecification) {
    this.layers.set(layer.id, layer)
    return this
  }

  getLayer(id: string) {
    return this.layers.get(id)
  }

  removeLayer(id: string) {
    this.layers.delete(id)
    return this
  }

  addControl(draw: MapboxDraw) {
    this.controls.push(draw)
    this.container.appendChild(draw.onAdd(this as unknown as MapboxMap))
    return this
  }

  remove = jest.fn(() => {
    for (const draw of this.controls)
      draw.onRemove(this as unknown as MapboxMap)
    this.listeners.clear()
    this.delegated.clear()
    this.sources.clear()
    this.layers.clear()
  })
}
