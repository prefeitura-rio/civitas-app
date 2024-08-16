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
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
  }
}

export function useReports(): UseReports {
  const [isVisible, setIsVisible] = useState(true)
  const { queryKey, formattedSearchParams } = useReportsSearchParams()

  const { data } = useQuery({
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
  })

  return {
    data: data?.items || [],
    layer,
    layerStates: {
      isVisible,
      setIsVisible,
    },
  }
}
