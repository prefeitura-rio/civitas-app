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
    () => createCollectionPointSources(radars.data),
    [radars.data],
  )
  const cameraSources = useMemo(
    () => createCameraSources(cameras.data),
    [cameras.data],
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
    [radars.layer, radars.sentryLayer, cameras.layer, cameras.dc3Layer],
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

  it('keeps both LPR data partitions and spatial indexes through hover, selection and visibility changes', () => {
    const { result } = renderHook(() => usePointLayers([]))
    const regularData = result.current.radars.layer.props.data
    const sentryData = result.current.radars.sentryLayer.props.data
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
      expect(result.current.radars.sentryLayer.props.data).toBe(sentryData)
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
    const sentryData = result.current.radars.sentryLayer.props.data
    jest.mocked(createPointClusterIndex).mockClear()

    rerender({ selected: [radar.cetRioCode] })

    expect(result.current.radars.layer.props.data).toBe(regularData)
    expect(result.current.radars.sentryLayer.props.data).toBe(sentryData)
    expect(result.current.radars.selectedObjects).toEqual([radar])
    expect(createPointClusterIndex).not.toHaveBeenCalled()
  })

  it('keeps both camera partitions and spatial indexes through hover, selection and visibility changes', () => {
    const { result } = renderHook(() => usePointLayers([]))
    const regularData = result.current.cameras.layer.props.data
    const dc3Data = result.current.cameras.dc3Layer.props.data
    jest.mocked(createPointClusterIndex).mockClear()

    const assertStableSources = () => {
      expect(result.current.cameras.layer.props.data).toBe(regularData)
      expect(result.current.cameras.dc3Layer.props.data).toBe(dc3Data)
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

  it('invalidates camera icons for hover and selection while retaining source data', () => {
    const { result } = renderHook(() => usePointLayers([]))

    act(() =>
      result.current.cameras.setHoveredObject({
        object: camera,
      } as PickingInfo<Camera>),
    )
    expect(
      result.current.cameras.layer.props.updateTriggers?.getIcon,
    ).toContain(camera.code)
    expect(
      result.current.cameras.dc3Layer.props.updateTriggers?.getIcon,
    ).toContain(camera.code)

    act(() => {
      result.current.cameras.setHoveredObject(null)
      result.current.cameras.handleSelectObject(mockCameras[1])
    })
    expect(
      result.current.cameras.dc3Layer.props.updateTriggers?.getIcon,
    ).toContain('CAM-2')
  })

  it('rebuilds the affected indexes and partitions when query data changes', () => {
    const { result, rerender } = renderHook(() => usePointLayers([]))
    const previousRadarData = result.current.radars.layer.props.data
    const previousCameraData = result.current.cameras.layer.props.data
    jest.mocked(createPointClusterIndex).mockClear()
    mockRadars = [{ ...radar, company: 'CIVITAS' }]
    mockCameras = [{ ...camera, sistemaOrigem: 'DC3' }]

    rerender()

    expect(result.current.radars.layer.props.data).not.toBe(previousRadarData)
    expect(result.current.radars.layer.props.data).toEqual([])
    expect(result.current.radars.sentryLayer.props.data).toEqual(mockRadars)
    expect(result.current.cameras.layer.props.data).not.toBe(previousCameraData)
    expect(result.current.cameras.layer.props.data).toEqual([])
    expect(result.current.cameras.dc3Layer.props.data).toEqual(mockCameras)
    expect(createPointClusterIndex).toHaveBeenCalledTimes(2)
  })
})
