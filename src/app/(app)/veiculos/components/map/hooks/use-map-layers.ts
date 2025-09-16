'use client'

import { useMemo } from 'react'

import { useMapStore } from '@/stores/use-map-store'

import { useAddressMarker } from './layers/use-address-marker'
import { useAgents } from './layers/use-agents'
import { useAISPLayer } from './layers/use-AISP-layer'
import { useBusStopLayer } from './layers/use-bus-stop-layer'
import { useCameraCOR } from './layers/use-cameras'
import { useCISPLayer } from './layers/use-CISP-layer'
import { useFogoCruzadoIncidents } from './layers/use-fogo-cruzado'
import { useRadarLayer } from './layers/use-radar-layer'
import { useSchoolLayer } from './layers/use-school-layer'
import { useTrips } from './layers/use-trips'
import { useWazePoliceAlerts } from './layers/use-waze-police-alerts'

export function useMapLayers() {
  // Get multipleSelectedRadars from Zustand store
  const multipleSelectedRadars = useMapStore(
    (state) => state.multipleSelectedRadars,
  )

  // Direct hook usage instead of context
  const radarLayer = useRadarLayer(multipleSelectedRadars)
  const cameraLayer = useCameraCOR()
  const agentsLayer = useAgents()
  const fogoCruzadoLayer = useFogoCruzadoIncidents()
  const wazeLayer = useWazePoliceAlerts()
  const tripLayers = useTrips({
    setViewport: useMapStore.getState().setViewport,
  })
  const addressMarker = useAddressMarker()
  const AISPLayer = useAISPLayer()
  const CISPLayer = useCISPLayer()
  const schoolLayer = useSchoolLayer()
  const busStopLayer = useBusStopLayer()

  // Extract commonly used properties
  const {
    data: radars,
    layer: radarLayerObj,
    handleMultiSelectObject: multiSelectRadar,
    setSelectedObject: setSelectedRadar,
    selectedObject: selectedRadar,
  } = radarLayer

  const {
    data: cameras,
    layer: cameraLayerObj,
    handleSelectObject: selectCamera,
    setSelectedObject: setSelectedCamera,
    selectedObject: selectedCamera,
  } = cameraLayer

  const {
    layerStates: {
      isVisible: isAddressVisible,
      setIsVisible: setIsAddressVisible,
      setAddressMarker,
    },
    layer: addressLayer,
  } = addressMarker

  const mapLayers = useMemo(
    () => [
      ...AISPLayer.layers,
      ...CISPLayer.layers,
      cameraLayerObj,
      radarLayerObj,
      wazeLayer.layer,
      fogoCruzadoLayer.layer,
      agentsLayer.layer,
      ...tripLayers.layers,
      addressLayer,
      schoolLayer.layers,
      busStopLayer.layers,
    ],
    [
      AISPLayer.layers,
      CISPLayer.layers,
      cameraLayerObj,
      radarLayerObj,
      wazeLayer.layer,
      fogoCruzadoLayer.layer,
      agentsLayer.layer,
      tripLayers.layers,
      addressLayer,
      schoolLayer.layers,
      busStopLayer.layers,
    ],
  )

  return {
    mapLayers,

    radars,
    selectedRadar,
    setSelectedRadar,
    multiSelectRadar,

    cameras,
    selectedCamera,
    setSelectedCamera,
    selectCamera,

    isAddressVisible,
    setIsAddressVisible,
    setAddressMarker,
  }
}
