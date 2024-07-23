// import type { PickingInfo } from '@deck.gl/core'
// import { GeoJsonLayer, IconLayer } from '@deck.gl/layers'
// import { useQuery } from '@tanstack/react-query'
// import { useState } from 'react'

// import cctvOrange from '@/assets/cctv-orange.svg'
// import { getRadars } from '@/http/radars/get-radars'
// import { Radar } from '@/models/entities'

// export function useWazePoliceAlerts() {
//   const [hoverInfo, setHoverInfo] = useState<PickingInfo<Radar>>(
//     {} as PickingInfo<Radar>,
//   )
//   const [isVisible, setIsVisible] = useState(false)
//   const [selectedRadar, setSelectedRadar] = useState()
//   const { data: response, isLoading } = useQuery({
//     queryKey: ['radars'],
//     queryFn: () => getRadars(),
//   })

//   const layer = new IconLayer<Radar>({
//     id: 'radars',
//     data: response?.data,
//     getPosition: (radar) => [radar.longitude, radar.latitude],
//     getSize: 24,
//     getIcon: () => ({
//       url: cctvOrange.src,
//       width: 48,
//       height: 48,
//       mask: false,
//     }),
//     pickable: true,
//     onClick: (radar) => setSelectedRadar(radar.object),
//     onHover: (info) => {
//       setHoverInfo(info)
//     },
//     highlightColor: [249, 115, 22, 255], // orange-500
//     autoHighlight: true,
//     visible: isVisible,
//     highlightedObjectIndex: hoverInfo.object ? hoverInfo.index : undefined,
//   })

//   return {
//     data: response?.data || [],
//     layer,
//     layerStates: {
//       isLoading,
//       isVisible,
//       setIsVisible,
//       hoverInfo,
//       setHoverInfo,
//       selectedRadar,
//       setSelectedRadar,
//     },
//   }
// }
