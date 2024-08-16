import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import crosshair from '@/assets/crosshair.svg'
import { getFogoCruzadoIncidents } from '@/http/layers/get-fogo-cruzado-incidents'
import { FogoCruzadoIncident } from '@/models/entities'

export interface UseFogoCruzadoIncidents {
  data: FogoCruzadoIncident[]
  failed: boolean
  layer: IconLayer<FogoCruzadoIncident, object>
  layerStates: {
    isLoading: boolean
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
    hoverInfo: PickingInfo<FogoCruzadoIncident>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<FogoCruzadoIncident>>>
  }
}

export function useFogoCruzadoIncidents(): UseFogoCruzadoIncidents {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<FogoCruzadoIncident>>(
    {} as PickingInfo<FogoCruzadoIncident>,
  )
  const [isVisible, setIsVisible] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['layers', 'fogocruzado'],
    queryFn: () => getFogoCruzadoIncidents(),
    refetchInterval: 1000 * 60 * 5, // 5 min
  })

  const layer = new IconLayer<FogoCruzadoIncident>({
    id: 'fogocruzado-incidents',
    data,
    pickable: true,
    getSize: 24,
    autoHighlight: true,
    highlightColor: [249, 115, 22, 250], // orange-500
    visible: isVisible,
    getIcon: () => ({
      url: crosshair.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    getPosition: (info) => [info.longitude, info.latitude],
    onHover: (info) => setHoverInfo(info),
  })
  console.log(!data && !isLoading)
  return {
    data: data || [],
    failed: !data && !isLoading,
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
