import type { PickingInfo } from '@deck.gl/core'
import { IconLayer, LineLayer, TextLayer } from '@deck.gl/layers'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'

import iconAtlas from '@/assets/icon-atlas.png'
import mapPinRed from '@/assets/map-pin-red.svg'
import { type UseCameraCOR, useCameraCOR } from '@/hooks/map-layers/use-cameras'
import { type UseRadars, useRadars } from '@/hooks/map-layers/use-radars'
import { useWazePoliceAlerts } from '@/hooks/map-layers/use-waze-police-alerts'
import type { WazeAlert } from '@/models/entities'
import type { Point } from '@/utils/formatCarPathResponse'

import { useCarPath } from '../hooks/use-contexts/use-car-path-context'

type Coordinates = [long: number, lat: number]

interface MapLayersContextProps {
  layerHooks: {
    camerasCOR: UseCameraCOR
    radars: UseRadars
  }
  layers: {
    lineLayer: LineLayer<Point, object>
    lineLayerTransparent: LineLayer<Point, object>
    blackIconLayer: IconLayer<Point, object>
    coloredIconLayer: IconLayer<Point, object>
    textLayer: TextLayer<Point, object>
    addressMarkerLayer: IconLayer<Coordinates, object>
    wazePoliceAlertsLayer: IconLayer<WazeAlert, object>
  }
  mapStates: {
    iconHoverInfo: PickingInfo<Point>
    lineHoverInfo: PickingInfo<Point>
    isMapStyleSatellite: boolean
    setIsMapStyleSatellite: Dispatch<SetStateAction<boolean>>
    isLinesEnabled: boolean
    setIsLinesEnabled: Dispatch<SetStateAction<boolean>>
    isIconColorEnabled: boolean
    setIsIconColorEnabled: Dispatch<SetStateAction<boolean>>
    isAddressMarkerEnabled: boolean
    setIsAddressMarkerEnabled: Dispatch<SetStateAction<boolean>>
    bbox: mapboxgl.LngLatBounds | undefined
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
  const { trips, selectedTripIndex, addressMarkerPosition, mapRef } =
    useCarPath()

  const [iconHoverInfo, setIconHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [lineHoverInfo, setLineHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [isMapStyleSatellite, setIsMapStyleSatellite] = useState(false)
  const [isLinesEnabled, setIsLinesEnabled] = useState(false)
  const [isIconColorEnabled, setIsIconColorEnabled] = useState(false)
  const [isAddressMarkerEnabled, setIsAddressMarkerEnabled] = useState(false)
  const points = trips?.at(selectedTripIndex)?.points

  const camerasCOR = useCameraCOR()
  const radars = useRadars()

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

  const bbox = mapRef.current?.getBounds()

  return (
    <MapLayersContext.Provider
      value={{
        layerHooks: {
          camerasCOR,
          radars,
        },
        layers: {
          lineLayer,
          lineLayerTransparent,
          blackIconLayer,
          coloredIconLayer,
          textLayer,
          addressMarkerLayer,
          wazePoliceAlertsLayer,
        },
        mapStates: {
          iconHoverInfo,
          lineHoverInfo,
          isMapStyleSatellite,
          setIsMapStyleSatellite,
          isLinesEnabled,
          setIsLinesEnabled,
          isIconColorEnabled,
          setIsIconColorEnabled,
          isAddressMarkerEnabled,
          setIsAddressMarkerEnabled,
          bbox,
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
