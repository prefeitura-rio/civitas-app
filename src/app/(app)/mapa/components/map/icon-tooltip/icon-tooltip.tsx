import { useMap } from '@/hooks/use-contexts/use-map-context'

import { CameraFullInfoPopup } from '../camera-info/camera-full-info-popup'
import { CameraInfoPopupCard } from '../camera-info/camera-info-popup'
import { IconTooltipCard } from './components/icon-tooltip-card'
import { LineTooltipCard } from './components/line-tooltip-card'
import { RadarTooltipCard } from './components/radar-tooltip-card'
import { WazePoliceAlertTooltip } from './components/waze-police-alert-tooltip'

export function IconTooltip() {
  const {
    layers: {
      trips: {
        layersState: { iconHoverInfo, lineHoverInfo },
      },
    },
  } = useMap()

  return (
    <>
      <IconTooltipCard {...iconHoverInfo} />
      <LineTooltipCard {...lineHoverInfo} />
      <CameraInfoPopupCard />
      <CameraFullInfoPopup />
      <RadarTooltipCard />
      <WazePoliceAlertTooltip />
    </>
  )
}
