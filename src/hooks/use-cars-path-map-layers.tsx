import type { PickingInfo } from '@deck.gl/core'
import { GeoJsonLayer, IconLayer, LineLayer, TextLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection } from 'geojson'
import { useState } from 'react'

import iconAtlas from '@/assets/icon-atlas.png'
import securityCamera from '@/assets/security-camera.png'
import type { CameraCor, Radar } from '@/models/entities'
import type { Point } from '@/utils/formatCarPathResponse'

import { useCarPath } from './use-contexts/use-car-path-context'

export interface InfoPopupProps {
  x: number
  y: number
  object: Pick<CameraCor, 'code' | 'location' | 'zone' | 'streamingUrl'>
}

export function useCarsPathMapLayers() {
  const {
    trips,
    selectedTripIndex,
    setHightlightedObject,
    cameras,
    selectedCamera,
    setSelectedCamera,
    addressMarkerPosition,
    mapRef,
    radars,
  } = useCarPath()

  const [iconHoverInfo, setIconHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [lineHoverInfo, setLineHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [cameraHoverInfo, setCameraHoverInfo] = useState<InfoPopupProps>(
    {} as InfoPopupProps,
  )
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

  const cameraLayerData = {
    type: 'FeatureCollection',
    features: cameras.map((item, index) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude, 0],
        },
        properties: {
          index,
          code: item.code,
          location: item.location,
          zone: item.zone,
          streamingUrl: item.streamingUrl,
        },
      } as Feature
    }),
  } as FeatureCollection

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
    getIcon: () => 'arrow',
    iconAtlas:
      'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    iconMapping: ICON_MAPPING,
  })

  const cameraLayer = new GeoJsonLayer({
    id: 'cameras',
    data: cameraLayerData,
    pickable: true,
    stroked: false,
    filled: true,
    pointRadiusMinPixels: 6,
    getIconSize: 20,
    getFillColor: (info) =>
      selectedCamera && info.properties.code === selectedCamera?.code
        ? [245, 158, 11, 255] // orange-500
        : [7, 76, 128, 250], // CIVITAS dark-blue
    autoHighlight: true,
    // highlightColor: [33, 175, 219, 255], // Primary (Turquoise)
    highlightColor: [245, 158, 11, 255], // orange-500
    onHover: (info) => {
      setCameraHoverInfo({
        x: info.x,
        y: info.y,
        object: info.object?.properties,
      })
      setHightlightedObject(info.object)
    },
    onClick: (info) => {
      setSelectedCamera(info.object?.properties)
    },
  })

  const radarLayer = new IconLayer<Radar>({
    id: 'radars',
    data: radars,
    getPosition: (radar) => [radar.longitude, radar.latitude],
    getSize: 30,
    getIcon: () => ({
      url: securityCamera.src,
      width: 24,
      height: 24,
      mask: false,
      anchorX: 12,
      anchorY: 12,
    }),
    pickable: true,
    onHover: (info) => setRadarHoverInfo(info),
  })

  const bbox = mapRef.current?.getBounds()

  return {
    layers: {
      lineLayer,
      lineLayerTransparent,
      cameraLayer,
      blackIconLayer,
      coloredIconLayer,
      textLayer,
      addressMarkerLayer,
      radarLayer,
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
    },
  }
}
