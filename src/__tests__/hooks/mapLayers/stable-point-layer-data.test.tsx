import { type PickingInfo } from '@deck.gl/core'
import { act, renderHook } from '@testing-library/react'
import { useMemo } from 'react'

import { useCamera } from '@/hooks/mapLayers/use-cameras'
import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import { useClusteredMapLayers } from '@/hooks/maps/use-clustered-map-layers'
import type { Camera, CollectionPoint } from '@/models/entities'
import { createPointClusterIndex } from '@/utils/point-clustering'
import {
  createCameraSources,
  createCollectionPointSources,
} from '@/utils/point-layer-sources'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('deck.gl', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual(
    '../../../../node_modules/supercluster/dist/supercluster.js',
  ),
)
jest.mock('@/utils/point-clustering', () => {
  const actual = jest.requireActual('@/utils/point-clustering')
  return {
    ...actual,
    createPointClusterIndex: jest.fn(actual.createPointClusterIndex),
  }
})
jest.mock('@/hooks/useQueries/useCollectionPoints', () => ({
  useCollectionPoints: () => ({ data: mockRadars }),
}))
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: mockCameras, isLoading: false }),
}))
jest.mock('@/http/cameras-cor/get-cameras-cor', () => ({
  getCamera: jest.fn(),
}))
jest.mock('@/stores/use-map-store', () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({ setMultipleSelectedRadars: jest.fn() }),
}))

const radar: CollectionPoint = {
  cetRioCode: 'LPR-1',
  company: 'GABRIEL',
  longitude: -43.2,
  latitude: -22.9,
  location: 'Centro',
  district: 'Centro',
  direction: null,
  lane: null,
  lastDetectionTime: null,
  activeInLast24Hours: true,
}
const camera: Camera = {
  code: 'CAM-1',
  sistemaOrigem: 'TIXI',
  longitude: -43.2,
  latitude: -22.9,
  location: 'Centro',
  zone: 'Centro',
  streamingUrl: '',
}
let mockRadars: CollectionPoint[]
let mockCameras: Camera[]
const viewport = { longitude: -43.2, latitude: -22.9, zoom: 12 }
const size = { width: 1000, height: 600 }
const setViewport = jest.fn()

function usePointLayers(selected: string[]) {
  const radars = useRadarLayer(selected)
  const cameras = useCamera()
  const radarSources = useMemo(
    () => createCollectionPointSources(radars.visibleData),
    [radars.visibleData],
  )
  const cameraSources = useMemo(
    () => createCameraSources(cameras.visibleData),
    [cameras.visibleData],
  )
  const sources = useMemo(
    () => [
      ...radarSources.map((source) => ({
        ...source,
        visible: radars.isVisible,
      })),
      ...cameraSources.map((source) => ({
        ...source,
        visible: cameras.isVisible,
      })),
    ],
    [radarSources, cameraSources, radars.isVisible, cameras.isVisible],
  )
  const clustered = useClusteredMapLayers(
    [radars.layer, cameras.layer],
    sources,
    viewport,
    size,
    setViewport,
  )
  return { radars, cameras, clustered }
}

describe('point source stability through visual interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRadars = [radar, { ...radar, cetRioCode: 'LPR-2', company: 'CIVITAS' }]
    mockCameras = [camera, { ...camera, code: 'CAM-2', sistemaOrigem: 'DC3' }]
  })

  it('separates overlapping camera icons without changing their coordinates or selection', () => {
    const { result } = renderHook(() => useCamera())
    const position = result.current.layer.props.getPosition as unknown as (
      point: Camera,
    ) => number[]
    expect(position(mockCameras[0])).toEqual([-43.2, -22.9])
    expect(position(mockCameras[1])[0]).toBeCloseTo(-43.19999, 8)
    expect(position(mockCameras[1])[1]).toBeCloseTo(-22.90001, 8)
    expect(mockCameras[1].longitude).toBe(-43.2)
    expect(mockCameras[1].latitude).toBe(-22.9)
    act(() => result.current.handleSelectObject(mockCameras[1]))
    expect(result.current.selectedObject).toBe(mockCameras[1])
    act(() => result.current.toggleOrigin('TIXI'))
    expect(result.current.visibleData).toEqual([mockCameras[1]])
    const filteredPosition = result.current.layer.props
      .getPosition as unknown as (point: Camera) => number[]
    expect(filteredPosition(mockCameras[1])[0]).toBeCloseTo(-43.19999, 8)
  })

  it('keeps LPR data and spatial indexes through hover, selection and visibility changes', () => {
    const { result } = renderHook(() => usePointLayers([]))
    const regularData = result.current.radars.layer.props.data
    const renderedRadarData = () => {
      const found = result.current.clustered.layers.find(
        (candidate) =>
          candidate &&
          !Array.isArray(candidate) &&
          candidate.id === result.current.radars.layer.id,
      )
      if (!found || Array.isArray(found))
        throw new Error('Missing rendered radar layer')
      return found.props.data
    }
    const renderedData = renderedRadarData()
    jest.mocked(createPointClusterIndex).mockClear()

    const assertStableSources = (checkRenderedData = true) => {
      expect(result.current.radars.layer.props.data).toBe(regularData)
      if (checkRenderedData) expect(renderedRadarData()).toBe(renderedData)
      expect(createPointClusterIndex).not.toHaveBeenCalled()
    }

    act(() =>
      result.current.radars.setHoveredObject({
        object: radar,
      } as PickingInfo<CollectionPoint>),
    )
    assertStableSources()
    act(() => result.current.radars.setSelectedObject(radar))
    assertStableSources()
    act(() => result.current.radars.setIsVisible(false))
    assertStableSources(false)
    expect(result.current.radars.layer.props.visible).toBe(false)
    act(() => result.current.radars.setIsVisible(true))
    assertStableSources(false)
  })

  it('keeps LPR source data when multiselection changes', () => {
    const { result, rerender } = renderHook(
      ({ selected }) => usePointLayers(selected),
      { initialProps: { selected: [] as string[] } },
    )
    const regularData = result.current.radars.layer.props.data
    jest.mocked(createPointClusterIndex).mockClear()

    rerender({ selected: [radar.cetRioCode] })

    expect(result.current.radars.layer.props.data).toBe(regularData)
    expect(result.current.radars.selectedObjects).toEqual([radar])
    expect(createPointClusterIndex).not.toHaveBeenCalled()
  })

  it('keeps camera data and spatial indexes through hover, selection and visibility changes', () => {
    const { result } = renderHook(() => usePointLayers([]))
    const regularData = result.current.cameras.layer.props.data
    jest.mocked(createPointClusterIndex).mockClear()

    const assertStableSources = () => {
      expect(result.current.cameras.layer.props.data).toBe(regularData)
      expect(createPointClusterIndex).not.toHaveBeenCalled()
    }

    act(() =>
      result.current.cameras.setHoveredObject({
        object: camera,
      } as PickingInfo<Camera>),
    )
    assertStableSources()
    act(() => result.current.cameras.handleSelectObject(camera))
    assertStableSources()
    act(() => result.current.cameras.setIsVisible(false))
    assertStableSources()
    act(() => result.current.cameras.setIsVisible(true))
    assertStableSources()
  })

  it('invalidates camera icons for hover and keeps default icon fill with a red ring on right-click selection', () => {
    const { result } = renderHook(() => usePointLayers([]))
    const getCameraIcon = (point: Camera) =>
      (
        result.current.cameras.layer.props.getIcon as unknown as (
          point: Camera,
        ) => string
      )(point)

    expect(result.current.cameras.highlightLayer).toBeNull()

    act(() =>
      result.current.cameras.setHoveredObject({
        object: camera,
      } as PickingInfo<Camera>),
    )
    expect(
      result.current.cameras.layer.props.updateTriggers?.getIcon,
    ).toContain(camera.code)
    expect(getCameraIcon(camera)).toBe('highlighted')

    act(() => {
      result.current.cameras.setHoveredObject(null)
      result.current.cameras.handleSelectObject(mockCameras[1])
    })
    expect(
      result.current.cameras.layer.props.updateTriggers?.getIcon,
    ).toContain('CAM-2')
    expect(getCameraIcon(mockCameras[1])).toBe('default')
    expect(result.current.cameras.highlightLayer).not.toBeNull()
  })

  it('rebuilds the affected indexes when query data changes', () => {
    const { result, rerender } = renderHook(() => usePointLayers([]))
    const previousRadarData = result.current.radars.layer.props.data
    const previousCameraData = result.current.cameras.layer.props.data
    jest.mocked(createPointClusterIndex).mockClear()
    mockRadars = [{ ...radar, company: 'CIVITAS' }]
    mockCameras = [{ ...camera, sistemaOrigem: 'DC3' }]

    rerender()

    expect(result.current.radars.layer.props.data).not.toBe(previousRadarData)
    expect(result.current.radars.layer.props.data).toEqual(mockRadars)
    expect(result.current.cameras.layer.props.data).not.toBe(previousCameraData)
    expect(result.current.cameras.layer.props.data).toEqual(mockCameras)
    expect(createPointClusterIndex).toHaveBeenCalledTimes(2)
  })

  it('filters origins out of both the icon layer and the cluster sources', () => {
    const { result } = renderHook(() => usePointLayers([]))
    jest.mocked(createPointClusterIndex).mockClear()

    act(() => result.current.radars.toggleOrigin('CIVITAS'))

    expect(result.current.radars.layer.props.data).toEqual([radar])
    expect(createPointClusterIndex).toHaveBeenCalledTimes(1)
    expect(result.current.radars.originCounts).toEqual([
      { origin: 'CIVITAS', count: 1 },
      { origin: 'GABRIEL', count: 1 },
    ])
  })
})
