import type { PickingInfo } from '@deck.gl/core'
import { act, renderHook } from '@testing-library/react'

import { useReports } from '@/hooks/mapLayers/use-reports'
import type { ClusterFeature } from '@/utils/point-clustering'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('supercluster', () =>
  jest.requireActual(
    '../../../../node_modules/supercluster/dist/supercluster.js',
  ),
)
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: records, isLoading: false }),
}))
jest.mock('@/hooks/useParams/useReportsSearchParams', () => ({
  useReportsSearchParams: () => ({ queryKey: [], formattedSearchParams: {} }),
}))
jest.mock('@/http/reports/dashboard/get-heatmap', () => ({
  getHeatmapReports: jest.fn(),
}))

const records = [
  { reportId: 'A', longitude: -43.2, latitude: -22.9 },
  { reportId: 'B', longitude: -43.2, latitude: -22.9 },
]
const bounds = [-45, -24, -42, -21]

describe('occurrence cluster interactions', () => {
  it('passes a native expansion target to the caller without imposing a transition', () => {
    const onClusterClick = jest.fn()
    const { result } = renderHook(() => useReports())
    const [icons, circles] = result.current.layers.clusteredIcons(
      bounds,
      12,
      onClusterClick,
    )
    const [cluster] = Array.from(circles.props.data as Iterable<ClusterFeature>)
    type Event = Parameters<NonNullable<typeof circles.props.onClick>>[1]

    circles.props.onClick?.(
      { object: cluster } as PickingInfo<ClusterFeature>,
      {} as Event,
    )

    expect(icons.props.data).toEqual([])
    expect(cluster.properties.originCounts).toEqual({ Ocorrências: 2 })
    expect(onClusterClick).toHaveBeenCalledWith({
      longitude: cluster.geometry.coordinates[0],
      latitude: cluster.geometry.coordinates[1],
      zoom: 17,
    })
  })

  it('returns all individual occurrences after the last clustered zoom', () => {
    const { result } = renderHook(() => useReports())
    const [icons, circles, labels] = result.current.layers.clusteredIcons(
      bounds,
      17,
    )

    expect(
      Array.from(icons.props.data as Iterable<{ reportId: string }>).map(
        (item) => item.reportId,
      ),
    ).toEqual(['A', 'B'])
    expect(circles.props.data).toEqual([])
    expect(labels.props.data).toEqual([])
  })

  it.each([16, 16.99])(
    'keeps occurrences represented by aggregates at zoom %s',
    (zoom) => {
      const { result } = renderHook(() => useReports())
      const [icons, circles, labels] = result.current.layers.clusteredIcons(
        bounds,
        zoom,
      )

      expect(icons.props.data).toEqual([])
      expect(
        Array.from(circles.props.data as Iterable<ClusterFeature>)[0].properties
          .point_count,
      ).toBe(2)
      expect(labels.props.data).toEqual(circles.props.data)
    },
  )

  it('applies the occurrence visibility toggle to individual icons and both aggregate layers', () => {
    const { result } = renderHook(() => useReports())
    act(() => result.current.layerStates.setIsIconsLayerVisible(false))
    expect(
      result.current.layers
        .clusteredIcons(bounds, 12)
        .every((layer) => layer.props.visible === false),
    ).toBe(true)

    act(() => result.current.layerStates.setIsIconsLayerVisible(true))
    expect(
      result.current.layers
        .clusteredIcons(bounds, 12)
        .every((layer) => layer.props.visible === true),
    ).toBe(true)
  })
})
