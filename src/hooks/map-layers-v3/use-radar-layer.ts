import { IconLayer, type PickingInfo } from 'deck.gl'
import { useMemo, useState } from 'react'

import type { Radar } from '@/models/entities'

import { useRadars } from '../use-queries/use-radars'

export function useRadarLayer() {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [clickedObject, setClickedObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [isVisible, setIsVisible] = useState(true)

  const { data } = useRadars()

  const layer = useMemo(
    () =>
      new IconLayer<Radar>({
        id: 'radars',
        data,
        pickable: true,
        iconAtlas:
          'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
        iconMapping: {
          marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
        },
        getIcon: () => 'marker',
        sizeScale: 15,
        getPosition: (d) => [d.longitude, d.latitude],
        getSize: () => 5,
        getColor: () => [240, 140, 10],
        visible: isVisible,
        onHover: (info) => setHoveredObject(info.object ? info : null),
        onClick: (info) => setClickedObject(info.object ? info : null),
      }),
    [data, isVisible],
  )

  return { data, layer, hoveredObject, clickedObject, isVisible, setIsVisible }
}
