import type { PickingInfo } from '@deck.gl/core'
import { IconLayer, LineLayer, TextLayer } from '@deck.gl/layers'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'

import cctvOrange from '@/assets/cctv-orange.svg'
import cctvOrangeFilled from '@/assets/cctv-orange-filled.svg'
import iconAtlas from '@/assets/icon-atlas.png'
import mapPinRed from '@/assets/map-pin-red.svg'
import videoCamera from '@/assets/video-camera.svg'
import videoCameraFilled from '@/assets/video-camera-filled.svg'
import { useWazePoliceAlerts } from '@/hooks/map-layers/use-waze-police-alerts'
import type { CameraCor, Radar, WazeAlert } from '@/models/entities'
import type { Point } from '@/utils/formatCarPathResponse'

import { useCarPath } from '../hooks/use-contexts/use-car-path-context'

export interface InfoPopupProps {
  x: number
  y: number
  object: Pick<CameraCor, 'code' | 'location' | 'zone' | 'streamingUrl'>
}

type Coordinates = [long: number, lat: number]

interface MapLayersContextProps {
  layers: {
    lineLayer: LineLayer<Point, object>
    lineLayerTransparent: LineLayer<Point, object>
    cameraLayer: IconLayer<CameraCor, object>
    selectedCameraLayer: IconLayer<CameraCor, object>
    blackIconLayer: IconLayer<Point, object>
    coloredIconLayer: IconLayer<Point, object>
    textLayer: TextLayer<Point, object>
    addressMarkerLayer: IconLayer<Coordinates, object>
    radarLayer: IconLayer<Radar, object>
    selectedRadarLayer: IconLayer<Radar, object>
    wazePoliceAlertsLayer: IconLayer<WazeAlert, object>
  }
  mapStates: {
    iconHoverInfo: PickingInfo<Point>
    lineHoverInfo: PickingInfo<Point>
    cameraHoverInfo: PickingInfo<CameraCor>
    isMapStyleSatellite: boolean
    setIsMapStyleSatellite: Dispatch<SetStateAction<boolean>>
    isLinesEnabled: boolean
    setIsLinesEnabled: Dispatch<SetStateAction<boolean>>
    isIconColorEnabled: boolean
    setIsIconColorEnabled: Dispatch<SetStateAction<boolean>>
    isCamerasEnabled: boolean
    setIsCamerasEnabled: Dispatch<SetStateAction<boolean>>
    isAddressMarkerEnabled: boolean
    setIsAddressMarkerEnabled: Dispatch<SetStateAction<boolean>>
    bbox: mapboxgl.LngLatBounds | undefined
    isRadarsEnabled: boolean
    setIsRadarsEnabled: Dispatch<SetStateAction<boolean>>
    radarHoverInfo: PickingInfo<Radar>
    setRadarHoverInfo: Dispatch<SetStateAction<PickingInfo<Radar>>>
    isWazePoliceAlertsLayerEnabled: boolean
    setIsWazePoliceAlertsLayerEnabled: Dispatch<SetStateAction<boolean>>
    wazePoliceAlertHoverInfo: PickingInfo<WazeAlert>
    setWazePoliceAlertHoverInfo: Dispatch<
      SetStateAction<PickingInfo<WazeAlert>>
    >
  }
}

export const MapLayersContext = createContext({} as MapLayersContextProps)

interface MapLayersContextProviderProps {
  children: ReactNode
}

export function MapLayersContextProvider({
  children,
}: MapLayersContextProviderProps) {
  const {
    trips,
    selectedTripIndex,
    cameras,
    selectedCamera,
    setSelectedCamera,
    addressMarkerPosition,
    mapRef,
    radars,
    setSelectedRadar,
    selectedRadar,
  } = useCarPath()

  const [iconHoverInfo, setIconHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [lineHoverInfo, setLineHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [cameraHoverInfo, setCameraHoverInfo] = useState<
    PickingInfo<CameraCor>
  >({} as PickingInfo<CameraCor>)
  const [radarHoverInfo, setRadarHoverInfo] = useState<PickingInfo<Radar>>(
    {} as PickingInfo<Radar>,
  )
  const [isMapStyleSatellite, setIsMapStyleSatellite] = useState(false)
  const [isLinesEnabled, setIsLinesEnabled] = useState(false)
  const [isIconColorEnabled, setIsIconColorEnabled] = useState(false)
  const [isCamerasEnabled, setIsCamerasEnabled] = useState(false)
  const [isAddressMarkerEnabled, setIsAddressMarkerEnabled] = useState(false)
  const [isRadarsEnabled, setIsRadarsEnabled] = useState(false)
  const points = trips?.at(selectedTripIndex)?.points

  const {
    layer: wazePoliceAlertsLayer,
    layerStates: {
      isVisible: isWazePoliceAlertsLayerEnabled,
      setIsVisible: setIsWazePoliceAlertsLayerEnabled,
      hoverInfo: wazePoliceAlertHoverInfo,
      setHoverInfo: setWazePoliceAlertHoverInfo,
    },
  } = useWazePoliceAlerts()

  // Assuming icon_atlas has an arrow icon at the specified coordinates
  const ICON_MAPPING = {
    arrow: { x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true },
  }

  function calculateColorInGradient(point: Point) {
    const startTime = new Date(point.startTime)
    const endTime = new Date(point.endTime || point.startTime)

    const diff = (endTime.getTime() - startTime.getTime()) / 1000 / 60 // difference in minutes

    const percent = diff / 60

    const color1 = { red: 97, green: 175, blue: 239 }
    const color2 = { red: 238, green: 38, blue: 47 }

    const result = {
      red: color1.red + percent * (color2.red - color1.red),
      green: color1.green + percent * (color2.green - color1.green),
      blue: color1.blue + percent * (color2.blue - color1.blue),
    }

    return [result.red, result.green, result.blue] as [number, number, number]
  }

  const lineLayer = new LineLayer<Point>({
    id: 'line-layer',
    data: points,
    getSourcePosition: (point) => point.from,
    getTargetPosition: (point) => point.to || point.from,
    getColor: calculateColorInGradient,
    getWidth: 3,
    pickable: true,
    onHover: (info) => setLineHoverInfo(info),
    visible: isLinesEnabled,
  })

  const lineLayerTransparent = new LineLayer<Point>({
    id: 'line-layer-transparent',
    data: points,
    getSourcePosition: (point) => point.from,
    getTargetPosition: (point) => point.to || point.from,
    getColor: [0, 0, 0, 0],
    getWidth: 30,
    pickable: true,
    onHover: (info) => setLineHoverInfo(info),
    visible: isLinesEnabled,
  })

  const blackIconLayer = new IconLayer<Point>({
    id: 'black-icon-layer',
    data: points,
    getPosition: (point) => point.from,
    getColor: [0, 0, 0],
    getSize: 30,
    getIcon: () => 'arrow',
    iconAtlas: iconAtlas.src,
    iconMapping: ICON_MAPPING,
    pickable: true,
    onHover: (info) => setIconHoverInfo(info),
    visible: !isIconColorEnabled,
  })

  const coloredIconLayer = new IconLayer<Point>({
    id: 'colored-icon-layer',
    data: points,
    getPosition: (point) => point.from,
    getColor: (point) =>
      point.to ? calculateColorInGradient(point) : [0, 0, 0],
    getSize: 30,
    getIcon: () => 'arrow',
    iconAtlas: iconAtlas.src,
    iconMapping: ICON_MAPPING,
    pickable: true,
    onHover: (info) => setIconHoverInfo(info),
    visible: isIconColorEnabled,
  })

  const textLayer = new TextLayer<Point>({
    id: 'text-layer',
    data: points,
    getPosition: (point) => point.from,
    getColor: [255, 255, 255],
    getSize: 15,
    getTextAnchor: 'middle',
    getText: (point) => String(point.index + 1),
    fontWeight: 10,
    getPixelOffset: [0, -16],
    pickable: true,
    onHover: (info) => setIconHoverInfo(info),
  })

  const addressMarkerLayer = new IconLayer({
    id: 'address-marker-layer',
    data: [
      {
        coordinates: [addressMarkerPosition[0], addressMarkerPosition[1]],
      },
    ],
    getPosition: (point) => {
      return point.coordinates
    },
    pickable: true,
    getColor: [245, 158, 11, 255],
    getSize: 40,
    getIcon: () => ({
      url: mapPinRed.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    visible: isAddressMarkerEnabled,
  })

  const cameraLayer = new IconLayer<CameraCor>({
    id: 'cameras',
    data: cameras,
    pickable: true,
    getSize: 24,
    autoHighlight: true,
    highlightColor: [7, 76, 128, 250], // CIVITAS-dark-blue
    visible: isCamerasEnabled,
    getIcon: () => ({
      url: videoCamera.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    getPosition: (camera) => [camera.longitude, camera.latitude],
    onHover: (info) => setCameraHoverInfo(info),
    onClick: (info) => {
      setSelectedCamera(info.object)
      cameraLayer.setNeedsUpdate()
    },
  })

  const radarLayer = new IconLayer<Radar>({
    id: 'radars',
    data: radars,
    getPosition: (radar) => [radar.longitude, radar.latitude],
    getSize: 24,
    getIcon: () => ({
      url: cctvOrange.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    pickable: true,
    onClick: (radar) => setSelectedRadar(radar.object),
    onHover: (info) => {
      setRadarHoverInfo(info)
    },
    highlightColor: [249, 115, 22, 255], // orange-500
    autoHighlight: true,
    visible: isRadarsEnabled,
    highlightedObjectIndex: radarHoverInfo.object
      ? radarHoverInfo.index
      : undefined,
  })

  const selectedRadarLayer = new IconLayer<Radar>({
    id: 'selected-radar',
    data: [selectedRadar],
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: cctvOrangeFilled.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    onHover: (info) => {
      setRadarHoverInfo(info)
    },
    visible: isRadarsEnabled && !!selectedRadar,
  })

  const selectedCameraLayer = new IconLayer<CameraCor>({
    id: 'selected-camera',
    data: [selectedCamera],
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: videoCameraFilled.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    onHover: (info) => {
      setCameraHoverInfo(info)
    },
    visible: isCamerasEnabled && !!selectedCamera,
  })

  const bbox = mapRef.current?.getBounds()

  console.log({
    isVisible: isWazePoliceAlertsLayerEnabled,
    setIsVisible: setIsWazePoliceAlertsLayerEnabled,
    hoverInfo: wazePoliceAlertHoverInfo,
    setHoverInfo: setWazePoliceAlertHoverInfo,
  })

  return (
    <MapLayersContext.Provider
      value={{
        layers: {
          lineLayer,
          lineLayerTransparent,
          cameraLayer,
          blackIconLayer,
          coloredIconLayer,
          textLayer,
          addressMarkerLayer,
          radarLayer,
          selectedRadarLayer,
          selectedCameraLayer,
          wazePoliceAlertsLayer,
        },
        mapStates: {
          iconHoverInfo,
          lineHoverInfo,
          cameraHoverInfo,
          isMapStyleSatellite,
          setIsMapStyleSatellite,
          isLinesEnabled,
          setIsLinesEnabled,
          isIconColorEnabled,
          setIsIconColorEnabled,
          isCamerasEnabled,
          setIsCamerasEnabled,
          isAddressMarkerEnabled,
          setIsAddressMarkerEnabled,
          bbox,
          isRadarsEnabled,
          setIsRadarsEnabled,
          radarHoverInfo,
          setRadarHoverInfo,
          isWazePoliceAlertsLayerEnabled,
          setIsWazePoliceAlertsLayerEnabled,
          wazePoliceAlertHoverInfo,
          setWazePoliceAlertHoverInfo,
        },
      }}
    >
      {children}
    </MapLayersContext.Provider>
  )
}
