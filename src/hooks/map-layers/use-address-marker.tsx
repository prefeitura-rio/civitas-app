import { IconLayer } from '@deck.gl/layers'
import { type Dispatch, type SetStateAction, useState } from 'react'

import mapPinRed from '@/assets/map-pin-red.svg'

type AddressMarker = {
  longitude: number
  latitude: number
}

export interface UseAddressMarker {
  layer: IconLayer<AddressMarker, object>
  layerStates: {
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
    addressMarker: AddressMarker | null
    setAddressMarker: Dispatch<SetStateAction<AddressMarker | null>>
  }
}

export function useAddressMarker(): UseAddressMarker {
  const [addressMarker, setAddressMarker] = useState<AddressMarker | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const layer = new IconLayer<AddressMarker>({
    id: 'address-marker-layer',
    data: addressMarker ? [addressMarker] : [],
    getPosition: (info) => [info.longitude, info.latitude],
    pickable: true,
    getColor: [245, 158, 11, 255],
    getSize: 40,
    getIcon: () => ({
      url: mapPinRed.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    visible: isVisible,
  })

  return {
    layer,
    layerStates: {
      isVisible,
      setIsVisible,
      addressMarker,
      setAddressMarker,
    },
  }
}
