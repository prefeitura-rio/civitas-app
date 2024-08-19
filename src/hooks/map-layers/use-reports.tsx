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
  layer: IconLayer<Report, object>
  layerStates: {
    isLoading: boolean
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
    hoverInfo: PickingInfo<Report>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<Report>>>
  }
}

export function useReports(): UseReports {
  const [isVisible, setIsVisible] = useState(true)
  const { queryKey, formattedSearchParams } = useReportsSearchParams()
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Report>>(
    {} as PickingInfo<Report>,
  )

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getReports(formattedSearchParams),
  })

  const layer = new IconLayer<Report>({
    id: 'radars',
    data: data?.items || [],
    getPosition: (info) => [info.longitude, info.latitude],
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
    visible: isVisible,
    onHover: (info) => setHoverInfo(info),
  })

  return {
    data: data?.items || [],
    layer,
    layerStates: {
      isLoading,
      isVisible,
      setIsVisible,
      hoverInfo,
      setHoverInfo,
    },
  }
}
