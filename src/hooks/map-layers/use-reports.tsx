import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import messageCircleWarning from '@/assets/message-circle-warning.svg'
import { getReports } from '@/http/reports/get-reports'
import type { Report } from '@/models/entities'

import { useReportsSearchParams } from '../use-params/use-reports-search-params'

export interface UseReports {
  data: Report[]
  failed: boolean
  layers: {
    icons: IconLayer<Report, object>
    heatmap: HeatmapLayer<Report, object>
  }
  layerStates: {
    isLoading: boolean
    hoverInfo: PickingInfo<Report>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<Report>>>
  }
}

export function useReports(): UseReports {
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

  const icons = new IconLayer<Report>({
    id: 'report-icons',
    data: filtered,
    getPosition: (info) => [info.longitude || 0, info.latitude || 0],
    getSize: 24,
    getIcon: () => ({
      url: messageCircleWarning.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    pickable: true,
    highlightColor: [249, 115, 22, 255], // orange-500
    autoHighlight: true,
    onHover: (info) => setHoverInfo(info),
  })

  const heatmap = new HeatmapLayer<Report>({
    id: 'reports-heatmap',
    data: filtered,
    aggregation: 'SUM',
    getPosition: (info) => [info.longitude || 0, info.latitude || 0],
    getWeight: () => 1,
    radiusPixels: 25,
  })

  return {
    data: data?.items || [],
    failed: !data && !isLoading,
    layers: {
      icons,
      heatmap,
    },
    layerStates: {
      isLoading,
      hoverInfo,
      setHoverInfo,
    },
  }
}
