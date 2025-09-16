'use client'

import { useMemo } from 'react'

import { useMap } from '@/hooks/useContexts/use-map-context'

export function useMapLayers() {
  const {
    layers: {
      radars: radarLayer,
      cameras: cameraLayer,
      agents: { layer: agentsLayer },
      fogoCruzado: fogoCruzadoLayer,
      waze: { layer: wazeLayer },
      trips: { layers: tripLayers },
      address: {
        layerStates: {
          isVisible: isAddressVisible,
          setIsVisible: setIsAddressVisible,
          setAddressMarker,
        },
        layer: addressLayer,
      },
      AISP: { layers: AISPLayer },
      CISP: { layers: CISPLayer },
      schools: { layers: schoolsLayer },
      busStops: { layers: busStopsLayer },
    },
  } = useMap()

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
    selectedObject: selectedFogoCruzado,
    setSelectedObject: setSelectedFogoCruzado,
    layer: fogoCruzadoLayerObj,
  } = fogoCruzadoLayer

  const mapLayers = useMemo(
    () => [
      ...AISPLayer,
      ...CISPLayer,
      cameraLayerObj,
      radarLayerObj,
      wazeLayer,
      fogoCruzadoLayerObj,
      agentsLayer,
      ...tripLayers,
      addressLayer,
      schoolsLayer,
      busStopsLayer,
    ],
    [
      AISPLayer,
      CISPLayer,
      cameraLayerObj,
      radarLayerObj,
      wazeLayer,
      fogoCruzadoLayerObj,
      agentsLayer,
      tripLayers,
      addressLayer,
      schoolsLayer,
      busStopsLayer,
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

    selectedFogoCruzado,
    setSelectedFogoCruzado,

    isAddressVisible,
    setIsAddressVisible,
    setAddressMarker,
  }
}
