import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

import { CameraFullInfoPopup } from '../camera-info/camera-full-info-popup'
import { CameraInfoPopupCard } from '../camera-info/camera-info-popup'
import { IconTooltipCard } from './components/icon-tooltip-card'
import { LineTooltipCard } from './components/line-tooltip-card'
import { RadarTooltipCard } from './components/radar-tooltip-card'
import { WazePoliceAlertTooltip } from './components/waze-police-alert-tooltip'

export function IconTooltip() {
  const {
    mapStates: { iconHoverInfo, lineHoverInfo, cameraHoverInfo },
  } = useMapLayers()

  return (
    <>
      <IconTooltipCard {...iconHoverInfo} />
      <LineTooltipCard {...lineHoverInfo} />
      <CameraInfoPopupCard {...cameraHoverInfo} />
      <CameraFullInfoPopup />
      <RadarTooltipCard />
      <WazePoliceAlertTooltip />
    </>
  )
}
