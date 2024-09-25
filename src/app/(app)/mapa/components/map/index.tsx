'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { DeckGL } from 'deck.gl'
import {
  Cctv,
  FlameKindling,
  Satellite,
  Siren,
  UsersRound,
  Video,
} from 'lucide-react'
import { useRef, useState } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { useMap } from '@/hooks/use-contexts/use-map-context'
import { getMapStyle, MapStyle } from '@/utils/get-map-style'

import { MAPBOX_ACCESS_TOKEN } from './components/constants'
import { AgentHoverCard } from './components/hover-cards/agent-hover-card'
import { CameraHoverCard } from './components/hover-cards/camera-hover-card'
import { FogoCruzadoHoverCard } from './components/hover-cards/fogo-cruzado-hover-card'
import { RadarHoverCard } from './components/hover-cards/radar-hover-card'
import { WazePoliceAlertHoverCard } from './components/hover-cards/waze-police-alert-hover-card'
import { MapLayerControl } from './components/layer-toggle'
import { SearchBox } from './components/search-box'
import { CameraSelectCard } from './components/select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from './components/select-cards/fogo-cruzado-select-card'

export function Map() {
  const {
    layers: {
      radars: {
        layer: radarLayer,
        hoveredObject: hoveredRadar,
        setIsHoveringInfoCard: setIsHoveringRadarInfoCard,
        isVisible: isRadarVisible,
        setIsVisible: setIsRadarVisible,
        data: radars,
      },
      cameras: {
        layer: cameraLayer,
        isVisible: isCameraVisible,
        setIsVisible: setIsCameraVisible,
        hoveredObject: hoveredCamera,
        selectedObject: selectedCamera,
        setSelectedObject: setSelectedCamera,
        setIsHoveringInfoCard: setIsHoveringCameraInfoCard,
        data: cameras,
      },
      agents: {
        layer: agentsLayer,
        isVisible: isAgentsVisible,
        setIsVisible: setIsAgentsVisible,
        hoveredObject: hoveredAgent,
        setIsHoveringInfoCard: setIsHoveringAgentInfoCard,
      },
      fogoCruzado: {
        layer: fogoCruzadoLayer,
        isVisible: isFogoCruzadoVisible,
        setIsVisible: setIsFogoCruzadoVisible,
        hoveredObject: hoveredFogoCruzado,
        setIsHoveringInfoCard: setIsHoveringFogoCruzadoInfoCard,
        selectedObject: selectedFogoCruzado,
        setSelectedObject: setSelectedFogoCruzado,
      },
      waze: {
        layer: wazeLayer,
        isVisible: isWazeVisible,
        setIsVisible: setIsWazeVisible,
        hoveredObject: hoveredWaze,
        setIsHoveringInfoCard: setIsHoveringWazeInfoCard,
      },
      trips: {
        layers: tripLayers,
        // hoveredObject: hoveredTrip,
        // setIsHoveringInfoCard: setIsHoveringTripInfoCard,
      },
      address: {
        layerStates: {
          isVisible: isAddressVisible,
          setIsVisible: setIsAddressVisible,
          setAddressMarker,
        },
        layer: addressLayer,
      },
    },
    viewport,
    setViewport,
  } = useMap()

  const [mapStyle, setMapStyle] = useState<MapStyle>(MapStyle.Map)
  const mapRef = useRef<MapRef | null>(null)

  // Add other layers
  const layers = [
    cameraLayer,
    radarLayer,
    wazeLayer,
    fogoCruzadoLayer,
    agentsLayer,
    ...tripLayers,
    addressLayer,
  ]

  return (
    <div className="relative h-full w-full overflow-hidden">
      <DeckGL
        initialViewState={viewport}
        controller
        onResize={() => mapRef?.current?.resize()}
        layers={layers}
        onViewStateChange={(e) => setViewport({ ...e.viewState })}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return 'grabbing'
          else if (isHovering) {
            // Actually clickable objects:
            if (hoveredRadar || hoveredCamera) return 'pointer'
          }
          return 'grab'
        }}
      >
        <MapGl
          ref={mapRef}
          mapStyle={getMapStyle(mapStyle)}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox
          isVisible={isAddressVisible}
          setIsVisible={setIsAddressVisible}
          setAddressMarker={setAddressMarker}
          setViewport={setViewport}
          onSubmit={(props) => {
            const id = props.address
            const radar = radars?.find((r) => {
              const trimmedCameraNumber = r.cameraNumber.replace(/^0+/, '')
              const trimmedCetRioCode = r.cetRioCode?.replace(/^0+/, '')
              const trimmedId = id.replace(/^0+/, '')
              return (
                trimmedCameraNumber === trimmedId ||
                trimmedCetRioCode === trimmedId
              )
            })
            if (radar) {
              setViewport({
                latitude: radar.latitude,
                longitude: radar.longitude,
                zoom: 20,
              })
              return
            }
            const camera = cameras?.find((c) => {
              const trimmedCode = c.code.replace(/^0+/, '')
              const trimmedId = id.replace(/^0+/, '')
              return trimmedCode === trimmedId
            })
            if (camera) {
              setViewport({
                latitude: camera.latitude,
                longitude: camera.longitude,
                zoom: 20,
              })
            }
          }}
        />
      </div>
      <RadarHoverCard
        hoveredObject={hoveredRadar}
        setIsHoveringInfoCard={setIsHoveringRadarInfoCard}
      />
      <CameraHoverCard
        hoveredObject={hoveredCamera}
        setIsHoveringInfoCard={setIsHoveringCameraInfoCard}
      />
      <CameraSelectCard
        selectedObject={selectedCamera}
        setSelectedObject={setSelectedCamera}
      />
      <FogoCruzadoHoverCard
        hoveredObject={hoveredFogoCruzado}
        setIsHoveringInfoCard={setIsHoveringFogoCruzadoInfoCard}
      />
      <FogoCruzadoSelectCard
        selectedObject={selectedFogoCruzado}
        setSelectedObject={setSelectedFogoCruzado}
      />
      <WazePoliceAlertHoverCard
        hoveredObject={hoveredWaze}
        setIsHoveringInfoCard={setIsHoveringWazeInfoCard}
      />
      <AgentHoverCard
        hoveredObject={hoveredAgent}
        setIsHoveringInfoCard={setIsHoveringAgentInfoCard}
      />
      <MapLayerControl
        layers={[
          {
            name: 'Radar',
            icon: <Cctv />,
            isVisible: isRadarVisible,
            setIsVisible: setIsRadarVisible,
          },
          {
            name: 'Câmeras',
            icon: <Video />,
            isVisible: isCameraVisible,
            setIsVisible: setIsCameraVisible,
          },
          {
            name: 'Agentes',
            icon: <UsersRound />,
            isVisible: isAgentsVisible,
            setIsVisible: setIsAgentsVisible,
          },
          {
            name: 'Policiamento (Waze)',
            icon: <Siren />,
            isVisible: isWazeVisible,
            setIsVisible: setIsWazeVisible,
          },
          {
            name: 'Fogo Cruzado',
            icon: <FlameKindling />,
            isVisible: isFogoCruzadoVisible,
            setIsVisible: setIsFogoCruzadoVisible,
          },
          {
            name: 'Satélite',
            icon: <Satellite />,
            isVisible: mapStyle === MapStyle.Satellite,
            setIsVisible: (satellite) => {
              setMapStyle(satellite ? MapStyle.Satellite : MapStyle.Map)
            },
          },
        ]}
      />
    </div>
  )
}
