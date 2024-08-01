import { AgentTooltipCard } from './components/agent-tooltip-card'
import { CameraInfoFixedPopup } from './components/camera-info-fixed-popup'
import { CameraInfoPopupCard } from './components/camera-info-popup'
import { TripLineTooltipCard } from './components/line-tooltip-card'
import { RadarTooltipCard } from './components/radar-tooltip-card'
import { TripPointTooltipCard } from './components/trip-point-tooltip-card'
import { WazePoliceAlertTooltip } from './components/waze-police-alert-tooltip'

export function IconTooltips() {
  return (
    <>
      <TripPointTooltipCard />
      <TripLineTooltipCard />
      <CameraInfoPopupCard />
      <CameraInfoFixedPopup />
      <RadarTooltipCard />
      <WazePoliceAlertTooltip />
      <AgentTooltipCard />
    </>
  )
}
