'use client'

import { useMemo, useRef } from 'react'

import { useMap } from '@/hooks/useContexts/use-map-context'
import type { BusStop, FogoCruzadoIncident, School } from '@/models/entities'
import { POINT_LAYER_IDS } from '@/utils/point-layer-config'
import {
  busStopAdapter,
  createCameraSources,
  createCollectionPointSources,
  incidentAdapter,
  type PreparedPointSource,
  preparePointSource,
  schoolAdapter,
} from '@/utils/point-layer-sources'

const EMPTY_SOURCES: PreparedPointSource[] = []
const prepareIncidents = (data: readonly FogoCruzadoIncident[] | undefined) => [
  preparePointSource(POINT_LAYER_IDS.incidents, data, incidentAdapter),
]
const prepareSchools = (data: readonly School[] | undefined) => [
  preparePointSource(POINT_LAYER_IDS.schools, data, schoolAdapter),
]
const prepareBusStops = (data: readonly BusStop[] | undefined) => [
  preparePointSource(POINT_LAYER_IDS.busStops, data, busStopAdapter),
]

/**
 * Defers domain adaptation until visible and retains the last prepared dataset.
 * Hidden data updates are adapted on reopening; unchanged data reuses its points.
 * The prepare callback must be stable and derive its output only from data.
 */
function usePreparedPointSources<T>(
  data: readonly T[] | undefined,
  visible: boolean,
  prepare: (data: readonly T[] | undefined) => PreparedPointSource[],
) {
  const cache = useRef<{
    data: readonly T[] | undefined
    sources: PreparedPointSource[]
  } | null>(null)
  return useMemo(() => {
    if (!visible) return cache.current?.sources ?? EMPTY_SOURCES
    if (!cache.current || cache.current.data !== data) {
      cache.current = { data, sources: prepare(data) }
    }
    return cache.current.sources
  }, [data, prepare, visible])
}

/**
 * Composes rendered layers and prepares typed geographic sources from query data.
 * Source points change only with domain data; visibility is applied separately so
 * selection, hover and camera updates do not invalidate the spatial index.
 */
export function useMapLayers() {
  const {
    layers: {
      radars: radarLayer,
      cameras: cameraLayer,
      fogoCruzado: fogoCruzadoLayer,
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
      schools,
      busStops,
    },
  } = useMap()

  const {
    data: radars,
    visibleData: visibleRadars,
    layer: radarLayerObj,
    handleMultiSelectObject: multiSelectRadar,
    setSelectedObject: setSelectedRadar,
    selectedObject: selectedRadar,
  } = radarLayer

  const {
    data: cameras,
    visibleData: visibleCameras,
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

  const lprSources = usePreparedPointSources(
    visibleRadars,
    radarLayer.isVisible,
    createCollectionPointSources,
  )
  const cameraSources = usePreparedPointSources(
    visibleCameras,
    cameraLayer.isVisible,
    createCameraSources,
  )
  const incidentSources = usePreparedPointSources(
    fogoCruzadoLayer.data,
    fogoCruzadoLayer.isVisible,
    prepareIncidents,
  )
  const schoolSources = usePreparedPointSources(
    schools.data,
    schools.isVisible,
    prepareSchools,
  )
  const busStopSources = usePreparedPointSources(
    busStops.data,
    busStops.isVisible,
    prepareBusStops,
  )
  const pointSources = useMemo(
    () => [
      ...lprSources.map((source) => ({
        ...source,
        visible: radarLayer.isVisible,
      })),
      ...cameraSources.map((source) => ({
        ...source,
        visible: cameraLayer.isVisible,
      })),
      ...incidentSources.map((source) => ({
        ...source,
        visible: fogoCruzadoLayer.isVisible,
      })),
      ...schoolSources.map((source) => ({
        ...source,
        visible: schools.isVisible,
      })),
      ...busStopSources.map((source) => ({
        ...source,
        visible: busStops.isVisible,
      })),
    ],
    [
      lprSources,
      cameraSources,
      incidentSources,
      schoolSources,
      busStopSources,
      radarLayer.isVisible,
      cameraLayer.isVisible,
      fogoCruzadoLayer.isVisible,
      schools.isVisible,
      busStops.isVisible,
    ],
  )

  const mapLayers = useMemo(
    () => [
      ...AISPLayer,
      ...CISPLayer,
      cameraLayerObj,
      radarLayerObj,
      fogoCruzadoLayerObj,
      ...tripLayers,
      addressLayer,
      schools.layers,
      busStops.layers,
    ],
    [
      AISPLayer,
      CISPLayer,
      cameraLayerObj,
      radarLayerObj,
      fogoCruzadoLayerObj,
      tripLayers,
      addressLayer,
      schools.layers,
      busStops.layers,
    ],
  )

  return {
    mapLayers,
    pointSources,

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
