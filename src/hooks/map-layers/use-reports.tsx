import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import type { PickingInfo } from '@deck.gl/core'
import { IconLayer, TextLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'
import Supercluster from 'supercluster'

import circle from '@/assets/circle.svg'
import messageCircleWarning from '@/assets/message-circle-warning.svg'
import { getReports, type ReportsResponse } from '@/http/reports/get-reports'
import type { Report } from '@/models/entities'
import type { Coordinates } from '@/models/utils'

import { useReportsSearchParams } from '../use-params/use-reports-search-params'

interface ClusterIcon extends Report {
  position: Coordinates
  icon: string
  size: number
  point_count: number
}
export interface UseReports {
  data: ReportsResponse | undefined
  failed: boolean
  layers: {
    heatmap: HeatmapLayer<Report, object>
    clusteredIcons: (
      bounds: number[],
      zoom: number,
    ) => [IconLayer<ClusterIcon, object>, TextLayer<ClusterIcon, object>]
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
  const [isIconsLayerVisible, setIsIconsLayerVisible] = useState(false)
  const [isHeatmapLayerVisible, setIsHeatmapLayerVisible] = useState(false)
  const { queryKey, formattedSearchParams } = useReportsSearchParams()
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Report>>(
    {} as PickingInfo<Report>,
  )

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getReports(formattedSearchParams),
  })

  const filtered =
    data?.items.filter((item) => !!item.longitude && !!item.latitude) || []

  const heatmap = new HeatmapLayer<Report>({
    id: 'reports-heatmap',
    data: filtered,
    aggregation: 'SUM',
    getPosition: (info) => [info.longitude || 0, info.latitude || 0],
    getWeight: () => 1,
    radiusPixels: 25,
    visible: isHeatmapLayerVisible,
  })

  function clusteredIcons(bounds: number[], zoom: number) {
    const index = new Supercluster({
      radius: 40, // Cluster radius in pixels
      maxZoom: 16, // Max zoom level for clustering
      minZoom: 0, // Min zoom level for clustering
      extent: 512, // Tile extent (512 by default)
      nodeSize: 64, // Size of the tile index node
    })

    index.load(
      filtered.map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.longitude || 0, item.latitude || 0],
        },
        properties: item,
      })),
    )

    const clusters = index.getClusters(
      [bounds[0], bounds[1], bounds[2], bounds[3]],
      zoom,
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedData = clusters.map((item: any) => {
      const isCluster = item.properties.cluster

      return {
        ...item.properties,
        position: [item.geometry.coordinates[0], item.geometry.coordinates[1]],
        icon: isCluster ? circle.src : messageCircleWarning.src, // Use different icons for clusters vs points
        size: item.properties.cluster
          ? 35 + 2 * item.properties.point_count
          : 30, // Scale icon size based on whether it's a cluster or point
        point_count: item.properties.point_count || 1, // For displaying number of points in a cluster
      }
    })

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
        if (!info.object?.cluster) {
          setHoverInfo(info)
        }
      },
      visible: isIconsLayerVisible,
    })

    const textLayer = new TextLayer<ClusterIcon>({
      id: 'clustered-report-icons-text',
      data: formattedData.filter((item) => item?.cluster),
      getPosition: (info) => info.position,
      getColor: [0, 0, 0],
      getSize: (info) => info.size * 0.5,
      getTextAnchor: 'middle',
      getText: (info) => String(info.point_count),
      fontWeight: 10,
      pickable: false,
      visible: isIconsLayerVisible,
    })

    return [iconLayer, textLayer] as [
      IconLayer<ClusterIcon, object>,
      TextLayer<ClusterIcon, object>,
    ]
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
