import '@testing-library/jest-dom'

import { act, fireEvent, render, screen } from '@testing-library/react'
import type { Feature, Point } from 'geojson'
import { StrictMode } from 'react'

import { PlaygroundMapStub } from '@/__mocks__/playground-map'
import { PlaygroundMap } from '@/app/(app)/playground/components/map'

const mockMaps: PlaygroundMapStub[] = []
jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: {
    Map: jest.fn(() => {
      const map = new PlaygroundMapStub()
      mockMaps.push(map)
      return map
    }),
  },
}))
// Exercise Draw 1.5.0 itself; only its Mapbox/WebGL host is substituted.
jest.mock('@mapbox/mapbox-gl-draw', () =>
  jest.requireActual(
    '../../../../node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw-unminified.js',
  ),
)

const point: Feature<Point> = {
  type: 'Feature',
  id: 'A',
  properties: { color: '#027516' },
  geometry: { type: 'Point', coordinates: [-43.2, -22.9] },
}

function loadedMap() {
  const view = render(<PlaygroundMap />)
  const map = mockMaps[mockMaps.length - 1]
  act(() => {
    map.fire('load')
    jest.advanceTimersByTime(20)
  })
  const draw = map.controls[0]
  return { ...view, map, draw }
}

describe('playground native Draw and cluster integration', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockMaps.length = 0
  })
  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('provides a public Draw style configuration instead of patching internal theme IDs', () => {
    const { map } = loadedMap()
    const drawLayers = [...map.layers.values()].filter(
      (layer) => layer.source !== 'playground-point-clusters',
    )
    expect(
      drawLayers.every((layer) => layer.id.startsWith('playground-draw-')),
    ).toBe(true)
    expect(drawLayers.some((layer) => layer.type === 'fill')).toBe(true)
    expect(drawLayers.some((layer) => layer.type === 'line')).toBe(true)
    expect(map.setFilter).not.toHaveBeenCalled()
    expect(map.setPaintProperty).not.toHaveBeenCalled()
  })

  it('mirrors programmatic Draw changes even though create/update events are suppressed', () => {
    const { map, draw } = loadedMap()
    const onCreate = jest.fn()
    map.on('draw.create', onCreate)
    act(() => {
      draw.add(point)
      jest.advanceTimersByTime(20)
    })

    expect(onCreate).not.toHaveBeenCalled()
    expect(map.getSource('playground-point-clusters')?.data.features).toEqual([
      expect.objectContaining({
        id: 'A',
        properties: expect.objectContaining({ color: '#027516' }),
      }),
    ])
  })

  it('selects a native leaf through Draw, opens the color editor and keeps its identity/color when deselected', () => {
    const { map, draw } = loadedMap()
    act(() => {
      draw.add(point)
      jest.advanceTimersByTime(20)
    })
    const source = map.getSource('playground-point-clusters')
    if (!source) throw new Error('Missing clustered source')
    const leaf = source.data.features[0]

    act(() =>
      map.fireLayer('click', 'playground-point-clusters-leaves', {
        features: [leaf],
      }),
    )

    expect(draw.getSelectedIds()).toEqual(['A'])
    expect(screen.getByLabelText('Cor:')).toHaveValue('#027516')
    expect(source.data.features).toEqual([])
    fireEvent.change(screen.getByLabelText('Cor:'), {
      target: { value: '#ff0000' },
    })
    act(() => {
      jest.advanceTimersByTime(20)
      draw.changeMode('simple_select', { featureIds: [] })
      jest.advanceTimersByTime(20)
    })

    expect(draw.get('A')?.properties?.color).toBe('#ff0000')
    expect(source.data.features).toEqual([
      expect.objectContaining({
        id: 'A',
        properties: expect.objectContaining({ color: '#ff0000' }),
      }),
    ])
  })

  it('removes its listeners and map on unmount, including pending native expansion callbacks', () => {
    const { map, unmount } = loadedMap()
    const source = map.getSource('playground-point-clusters')
    if (!source) throw new Error('Missing clustered source')
    let complete: ((error: Error | null, zoom?: number) => void) | undefined
    source.getClusterExpansionZoom.mockImplementation((_id, callback) => {
      complete = callback
    })
    act(() =>
      map.fireLayer('click', 'playground-point-clusters-circle', {
        features: [
          {
            type: 'Feature',
            properties: { cluster_id: 10 },
            geometry: { type: 'Point', coordinates: [-43.2, -22.9] },
          },
        ],
      }),
    )
    unmount()
    complete?.(null, 17)

    expect(map.remove).toHaveBeenCalledTimes(1)
    expect(map.easeTo).not.toHaveBeenCalled()
  })

  it('mirrors coordinate updates/deletes and skips worker updates for unchanged point data', () => {
    const { map, draw } = loadedMap()
    const source = map.getSource('playground-point-clusters')
    if (!source) throw new Error('Missing clustered source')
    act(() => {
      draw.add(point)
      jest.advanceTimersByTime(20)
    })
    source.setData.mockClear()
    act(() => {
      draw.add(point)
      jest.advanceTimersByTime(20)
    })
    expect(source.setData).not.toHaveBeenCalled()
    act(() => {
      draw.add({
        ...point,
        geometry: { type: 'Point', coordinates: [-44, -23] },
      })
      jest.advanceTimersByTime(20)
    })
    expect(source.data.features[0].geometry).toEqual({
      type: 'Point',
      coordinates: [-44, -23],
    })
    act(() => {
      draw.delete('A')
      jest.advanceTimersByTime(20)
    })
    expect(source.data.features).toEqual([])
  })

  it('delegates expansion to the native callback and does not move the camera on errors', () => {
    const { map } = loadedMap()
    const source = map.getSource('playground-point-clusters')
    if (!source) throw new Error('Missing clustered source')
    const event = {
      features: [
        {
          properties: { cluster_id: 12 },
          geometry: { type: 'Point', coordinates: [-43.2, -22.9] },
        },
      ],
    }
    act(() => map.fireLayer('click', 'playground-point-clusters-circle', event))
    expect(source.getClusterExpansionZoom).toHaveBeenCalledWith(
      12,
      expect.any(Function),
    )
    expect(map.easeTo).toHaveBeenCalledWith({
      center: [-43.2, -22.9],
      zoom: 17,
    })
    source.getClusterExpansionZoom.mockImplementation((_id, callback) =>
      callback(new Error('stale cluster')),
    )
    map.easeTo.mockClear()
    act(() => map.fireLayer('click', 'playground-point-clusters-circle', event))
    expect(map.easeTo).not.toHaveBeenCalled()
  })

  it('keeps combined points represented and selects their parent from a native leaf', () => {
    const { map, draw } = loadedMap()
    act(() => {
      draw.add(point)
      draw.add({
        ...point,
        id: 'B',
        geometry: { type: 'Point', coordinates: [-43.21, -22.91] },
      })
      draw.changeMode('simple_select', { featureIds: ['A', 'B'] })
      draw.combineFeatures()
      jest.advanceTimersByTime(20)
      draw.changeMode('simple_select', { featureIds: [] })
      jest.advanceTimersByTime(20)
    })
    const source = map.getSource('playground-point-clusters')
    if (!source) throw new Error('Missing clustered source')
    const combined = draw.getAll().features[0]
    expect(combined.geometry.type).toBe('MultiPoint')
    expect(source.data.features).toHaveLength(2)
    act(() =>
      map.fireLayer('click', 'playground-point-clusters-leaves', {
        features: [source.data.features[0]],
      }),
    )
    expect(draw.getSelectedIds()).toEqual([combined.id])
    expect(source.data.features).toEqual([])
    act(() => {
      draw.uncombineFeatures()
      jest.advanceTimersByTime(20)
      draw.changeMode('simple_select', { featureIds: [] })
      jest.advanceTimersByTime(20)
    })
    expect(source.data.features).toHaveLength(2)
    expect(
      draw
        .getAll()
        .features.every((feature) => feature.geometry.type === 'Point'),
    ).toBe(true)
  })

  it('preserves Shift-click selection when Draw sees the native leaf click as empty space', () => {
    const { map, draw } = loadedMap()
    act(() => {
      draw.add(point)
      draw.add({ ...point, id: 'B' })
      jest.advanceTimersByTime(20)
    })
    const source = map.getSource('playground-point-clusters')
    if (!source) throw new Error('Missing clustered source')
    act(() =>
      map.fireLayer('click', 'playground-point-clusters-leaves', {
        features: [source.data.features[0]],
      }),
    )
    expect(draw.getSelectedIds()).toEqual(['A'])
    const second = source.data.features[0]
    const event = {
      point: { x: 200, y: 200 },
      lngLat: { lng: -43.2, lat: -22.9 },
      originalEvent: {
        button: 0,
        buttons: 0,
        shiftKey: true,
        stopPropagation: jest.fn(),
      },
    }
    act(() => {
      map.fire('mousedown', event)
      map.fire('mouseup', event)
      expect(draw.getSelectedIds()).toEqual([])
      map.fireLayer('click', 'playground-point-clusters-leaves', {
        ...event,
        features: [second],
      })
    })

    expect(draw.getSelectedIds()).toEqual(['A', 'B'])
    expect(source.data.features).toEqual([])
  })

  it('retains line/polygon geometries, colors and native editing vertices/midpoints', () => {
    const { map, draw } = loadedMap()
    act(() => {
      draw.add({
        ...point,
        id: 'line',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-43, -22],
            [-44, -23],
          ],
        },
      })
      draw.add({
        ...point,
        id: 'polygon',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-43, -22],
              [-44, -22],
              [-44, -23],
              [-43, -22],
            ],
          ],
        },
      })
      draw.changeMode('direct_select', { featureId: 'line' })
      jest.advanceTimersByTime(20)
    })
    const displayed = [...map.sources.values()].flatMap(
      (source) => source.data.features,
    )
    expect(
      displayed.some((feature) => feature.geometry.type === 'Polygon'),
    ).toBe(true)
    expect(
      displayed.some((feature) => feature.properties?.meta === 'vertex'),
    ).toBe(true)
    expect(
      displayed.some((feature) => feature.properties?.meta === 'midpoint'),
    ).toBe(true)
    fireEvent.change(screen.getByLabelText('Cor:'), {
      target: { value: '#ff0000' },
    })
    act(() => jest.advanceTimersByTime(20))
    expect(draw.get('line')?.properties?.color).toBe('#ff0000')
    const coloredLine = [...map.sources.values()]
      .flatMap((source) => source.data.features)
      .find(
        (feature) =>
          feature.geometry.type === 'LineString' &&
          feature.properties?.id === 'line',
      )
    expect(coloredLine?.properties?.user_color).toBe('#ff0000')
    expect(map.getSource('playground-point-clusters')?.data.features).toEqual(
      [],
    )
  })

  it('does not initialize Draw if the map load arrives after unmount', () => {
    const { unmount } = render(<PlaygroundMap />)
    const map = mockMaps[0]
    const [load] = [...(map.listeners.get('load') ?? [])]
    unmount()
    act(() => load({}))

    expect(map.controls).toEqual([])
    expect(map.remove).toHaveBeenCalledTimes(1)
  })

  it('supports React strict-mode effect cleanup and remount without retaining the first map', () => {
    const { unmount } = render(
      <StrictMode>
        <PlaygroundMap />
      </StrictMode>,
    )
    expect(mockMaps).toHaveLength(2)
    expect(mockMaps[0].remove).toHaveBeenCalledTimes(1)
    act(() => {
      mockMaps[1].fire('load')
      jest.advanceTimersByTime(20)
    })
    expect(mockMaps[1].controls).toHaveLength(1)
    unmount()
    expect(mockMaps[1].remove).toHaveBeenCalledTimes(1)
  })

  it('keeps native cluster handlers out of the way while placing a point', () => {
    const { map, draw } = loadedMap()
    act(() => {
      draw.changeMode('draw_point')
      jest.advanceTimersByTime(20)
    })
    expect(
      map.delegated.get('click:playground-point-clusters-leaves')?.size ?? 0,
    ).toBe(0)
    expect(map.getSource('playground-point-clusters')?.data.features).toEqual(
      [],
    )
    const event = {
      point: { x: 200, y: 200 },
      lngLat: { lng: -43.2, lat: -22.9 },
      originalEvent: { button: 0, buttons: 0, stopPropagation: jest.fn() },
    }
    act(() => {
      map.fire('mousedown', event)
      map.fire('mouseup', event)
      jest.advanceTimersByTime(20)
    })
    expect(draw.getMode()).toBe('simple_select')
    expect(draw.getAll().features).toHaveLength(1)
    expect(draw.getSelectedIds()).toHaveLength(1)
    expect(
      map.delegated.get('click:playground-point-clusters-leaves')?.size,
    ).toBe(1)
  })
})
