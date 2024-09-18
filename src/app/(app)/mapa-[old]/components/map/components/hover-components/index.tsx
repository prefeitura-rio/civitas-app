import { AgentHoverCard } from './components/agent-hover-card'
import { CameraHoverCard } from './components/camera-hover-card'
import { FogoCruzadoHoverCard } from './components/fogo-cruzado-hover-card'
import { RadarHoverCard } from './components/radar-hover-card'
import { TripPointHoverCard } from './components/trip-point-hover-card'
import { WazePoliceAlertHoverCard } from './components/waze-police-alert-hover-card'

export function HoverComponents() {
  return (
    <>
      <TripPointHoverCard />
      <CameraHoverCard />
      <RadarHoverCard />
      <WazePoliceAlertHoverCard />
      <AgentHoverCard />
      <FogoCruzadoHoverCard />
    </>
  )
}
