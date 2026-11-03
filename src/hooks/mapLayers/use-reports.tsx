import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import type { PickingInfo } from '@deck.gl/core'
import { IconLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'

import messageCircleWarning from '@/assets/message-circle-warning.svg'
import {
  getHeatmapReports,
  type HeatmapCoordinates,
} from '@/http/reports/dashboard/get-heatmap'
import type { Report } from '@/models/entities'
import type { Coordinates } from '@/models/utils'
import {
  type ClusterExpansionTarget,
  type ClusterFeature,
  createClusterLayers,
  createPointClusterIndex,
  getClusterExpansionTarget,
  isIndexedPointFeature,
} from '@/utils/point-clustering'

import { useReportsSearchParams } from '../useParams/useReportsSearchParams'

interface ClusterIcon extends HeatmapCoordinates {
  position: Coordinates
  icon: string
  size: number
  point_count: number
}
export interface UseReports {
  data: HeatmapCoordinates[] | undefined
  failed: boolean
  layers: {
    heatmap: HeatmapLayer<Report, object>
    clusteredIcons: (
      bounds: number[],
      zoom: number,
      onClusterClick?: (target: ClusterExpansionTarget) => void,
    ) => [
      IconLayer<ClusterIcon, object>,
      ScatterplotLayer<ClusterFeature, object>,
      TextLayer<ClusterFeature, object>,
    ]
  }
  layerStates: {
    isLoading: boolean
    hoverInfo: PickingInfo<Report>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<Report>>>
    isIconsLayerVisible: boolean
    setIsIconsLayerVisible: Dispatch<SetStateAction<boolean>>
    isHeatmapLayerVisible: boolean
    setIsHeatmapLayerVisible: Dispatch<SetStateAction<boolean>>
  }
}

export function useReports(): UseReports {
  const [isIconsLayerVisible, setIsIconsLayerVisible] = useState(true)
  const [isHeatmapLayerVisible, setIsHeatmapLayerVisible] = useState(false)
  const { queryKey, formattedSearchParams } = useReportsSearchParams()
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Report>>(
    {} as PickingInfo<Report>,
  )

  const { data, isLoading } = useQuery({
    queryKey: ['heatmap', ...queryKey],
    queryFn: () => getHeatmapReports(formattedSearchParams),
  })

  const filtered = useMemo(
    () =>
      data ? data.filter((item) => !!item.longitude && !!item.latitude) : [],
    [data],
  )

  const clusterIndex = useMemo(
    () =>
      createPointClusterIndex(
        filtered.map((report) => ({
          id: report.reportId,
          coordinates: [report.longitude || 0, report.latitude || 0],
          origin: 'Ocorrências',
          point: report,
        })),
      ),
    [filtered],
  )

  const heatmap = new HeatmapLayer<Report>({
    id: 'reports-heatmap',
    data: filtered,
    aggregation: 'SUM',
    getPosition: (info) => [info.longitude || 0, info.latitude || 0],
    getWeight: () => 1,
    radiusPixels: 25,
    visible: isHeatmapLayerVisible,
  })

  /**
   * Builds individual occurrence icons and aggregate circles/count labels.
   *
   * @param bounds - Query bounds in [west, south, east, north] order, in degrees.
   * @param zoom - Camera zoom, floored to an integer for the spatial query.
   * @param onClusterClick - Receives the aggregate center and native expansion zoom;
   * the caller owns the camera update and its existing animation policy.
   * @returns Layers ordered as [individual icons, cluster circles, cluster labels].
   */
  function clusteredIcons(
    bounds: number[],
    zoom: number,
    onClusterClick?: (target: ClusterExpansionTarget) => void,
  ) {
    const clusters = clusterIndex.getClusters(
      [bounds[0], bounds[1], bounds[2], bounds[3]],
      Math.max(0, Math.floor(zoom)),
    )
    const leaves = clusters
      .filter(isIndexedPointFeature)
      .map((feature) => feature.properties.point)
    const formattedData = leaves.map((report) => ({
      ...report,
      position: [report.longitude || 0, report.latitude || 0] as Coordinates,
      icon: messageCircleWarning.src,
      size: 30,
      point_count: 1,
    }))

    const iconLayer = new IconLayer<ClusterIcon>({
      id: 'clustered-report-icons',
      data: formattedData,
      getPosition: (info) => info.position,
      getSize: (info) => info.size,
      getIcon: (info) => ({
        url: info.icon,
        width: info.size,
        height: info.size,
        mask: false,
      }),
      pickable: true,
      highlightColor: [249, 115, 22, 255], // orange-500
      autoHighlight: true,
      onHover: (info) => {
        setHoverInfo(info.object ? info : ({} as PickingInfo<Report>))
      },
      visible: isIconsLayerVisible,
    })
    const [clusterCircles, clusterLabels] = createClusterLayers(
      'clustered-report-icons',
      clusters,
      (feature) => {
        onClusterClick?.(getClusterExpansionTarget(clusterIndex, feature))
      },
    )

    return [
      iconLayer,
      clusterCircles.clone({ visible: isIconsLayerVisible }),
      clusterLabels.clone({ visible: isIconsLayerVisible }),
    ] satisfies ReturnType<UseReports['layers']['clusteredIcons']>
  }
  return {
    data,
    failed: !data && !isLoading,
    layers: {
      heatmap,
      clusteredIcons,
    },
    layerStates: {
      isLoading,
      hoverInfo,
      setHoverInfo,
      isIconsLayerVisible,
      setIsIconsLayerVisible,
      isHeatmapLayerVisible,
      setIsHeatmapLayerVisible,
    },
  }
}
