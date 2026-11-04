import { WebMercatorViewport } from '@deck.gl/core'
import { act, renderHook } from '@testing-library/react'

import { useCollectionPointPickerState } from '@/components/custom/collection-point-picker/use-collection-point-picker-state'
import type { CollectionPoint } from '@/models/entities'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual('../../../node_modules/supercluster/dist/supercluster.js'),
)
jest.mock('@/hooks/useQueries/useCollectionPoints', () => ({
  useCollectionPoints: () => ({ data: points, isPending: false }),
}))
jest.mock('@/http/mapbox/get-places', () => ({ getPlaces: jest.fn() }))

const viewport = {
  longitude: -43.2,
  latitude: -22.9,
  zoom: 12,
  pitch: 0,
  bearing: 0,
}
const projection = new WebMercatorViewport({
  ...viewport,
  width: 720,
  height: 620,
})
const [outsideLongitude, outsideLatitude] = projection.unproject([-32, 310])
const point: CollectionPoint = {
  cetRioCode: 'CENTER',
  company: 'CIVITAS',
  longitude: viewport.longitude,
  latitude: viewport.latitude,
  location: 'Centro',
  district: 'Centro',
  direction: null,
  lane: null,
  lastDetectionTime: null,
  activeInLast24Hours: true,
}
const points = [
  point,
  {
    ...point,
    cetRioCode: 'OUTSIDE',
    longitude: outsideLongitude,
    latitude: outsideLatitude,
  },
]
const pickerProps = { value: [], onChange: jest.fn() }

describe('collection point picker viewport bounds', () => {
  it.each([45, 90, 180])(
    'keeps a visible point in the list and avoids recentering at bearing %s',
    (bearing) => {
      const { result } = renderHook(() =>
        useCollectionPointPickerState(pickerProps),
      )
      act(() => {
        result.current.handleMapResize({ width: 720, height: 620 })
        result.current.handleViewStateChange({ ...viewport, bearing })
      })

      expect(result.current.listBuckets.visibleIds.has('CENTER')).toBe(true)

      const previousViewState = result.current.viewState
      act(() => result.current.previewPoint(point))

      expect(result.current.viewState).toEqual(previousViewState)
    },
  )

  it('does not count the cluster query margin as visible in the list', () => {
    const { result } = renderHook(() =>
      useCollectionPointPickerState(pickerProps),
    )
    act(() => {
      result.current.handleMapResize({ width: 720, height: 620 })
      result.current.handleViewStateChange(viewport)
    })

    expect(result.current.listBuckets.visibleIds.has('CENTER')).toBe(true)
    expect(result.current.listBuckets.visibleIds.has('OUTSIDE')).toBe(false)
  })
})
