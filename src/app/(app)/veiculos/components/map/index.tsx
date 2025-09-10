'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import { type Deck, DeckGL } from 'deck.gl'
import { type MouseEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { useMap } from '@/hooks/useContexts/use-map-context'
import type { CameraCOR, Radar } from '@/models/entities'
import { getMapStyle } from '@/utils/get-map-style'

import { MAPBOX_ACCESS_TOKEN } from './components/constants'
import { ContextMenu } from './components/context-menu'
import { HoverCards } from './components/hover-cards'
import { MapLayerControl } from './components/layer-toggle'
import { SearchBox } from './components/search-box'
import { SelectionCards } from './components/select-cards'

interface SearchSubmitProps {
  address: string
}

type CursorParams = {
  isDragging: boolean
  isHovering: boolean
}

export function Map() {
  const deckRef = useRef<Deck | null>(null)
  const mapRef = useRef<MapRef | null>(null)
  const mouseDownPosition = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)

  const {
    layers: {
      radars: {
        layer: radarLayer,
        data: radars,
        handleSelectObject: selectRadar,
        handleMultiSelectObject: multiSelectRadar,
        setSelectedObject: setSelectedRadar,
      },
      cameras: {
        layer: cameraLayer,
        data: cameras,
        handleSelectObject: selectCamera,
        setSelectedObject: setSelectedCamera,
      },
      agents: { layer: agentsLayer },
      fogoCruzado: { layer: fogoCruzadoLayer },
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
    viewport,
    setViewport,
    mapStyle,
    setMapRef,
    setDeckRef,
    contextMenuPickingInfo,
    openContextMenu,
    setContextMenuPickingInfo,
    setOpenContextMenu,
    zoomToLocation,
  } = useMap()

  useEffect(() => {
    setMapRef(mapRef.current)
    setDeckRef(deckRef.current)
  }, [setMapRef, setDeckRef])

  const mapLayers = useMemo(
    () => [
      ...AISPLayer,
      ...CISPLayer,
      cameraLayer,
      radarLayer,
      wazeLayer,
      fogoCruzadoLayer,
      agentsLayer,
      ...tripLayers,
      addressLayer,
      schoolsLayer,
      busStopsLayer,
    ],
    [
      AISPLayer,
      CISPLayer,
      cameraLayer,
      radarLayer,
      wazeLayer,
      fogoCruzadoLayer,
      agentsLayer,
      tripLayers,
      addressLayer,
      schoolsLayer,
      busStopsLayer,
    ],
  )

  const handleRightClick = useCallback(
    (e: MouseEvent) => {
      console.log('🖱️ Map - RIGHT CLICK HANDLER CALLED!', {
        button: e.button,
        buttons: e.buttons,
        type: e.type,
        target: e.target,
        currentTarget: e.currentTarget,
      })
      e.preventDefault()
      e.stopPropagation()
      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })

      console.log('🖱️ Map - Right click detected', {
        x,
        y,
        layerId: info?.layer?.id,
        objectType: info?.object ? typeof info.object : 'none',
        hasRadarLayer: info?.layer?.id === 'radars',
        hasObject: !!info?.object,
        radarCode:
          info?.layer?.id === 'radars' && info.object
            ? (info.object as Radar).cetRioCode
            : 'none',
      })

      // Seleção INDIVIDUAL de radar com botão direito (popup + zoom)
      if (info?.layer?.id === 'radars' && info.object) {
        const radar = info.object as Radar
        console.log('🖱️ Map - Right click on radar, calling selectRadar', {
          radarCode: radar.cetRioCode,
        })
        selectRadar(radar, () => setSelectedCamera(null))
        // Zoom inteligente que respeita o zoom manual do usuário
        zoomToLocation(radar.latitude, radar.longitude, 18)
        return
      }

      if (info?.layer?.id === 'cameras' && info.object) {
        const camera = info.object as CameraCOR
        selectCamera(camera)
        setSelectedRadar(null)
        // Zoom inteligente que respeita o zoom manual do usuário
        zoomToLocation(camera.latitude, camera.longitude, 18)
        return
      }

      // Menu de contexto para outros elementos
      setContextMenuPickingInfo(info || null)
      setOpenContextMenu(!!info)
    },
    [
      setContextMenuPickingInfo,
      setOpenContextMenu,
      selectRadar,
      selectCamera,
      setSelectedCamera,
      setSelectedRadar,
      zoomToLocation,
    ],
  )

  const handleMouseDown = useCallback((e: MouseEvent) => {
    console.log('🖱️ Map - MOUSE DOWN DETECTED!', {
      button: e.button,
      buttons: e.buttons,
      type: e.type,
    })
    
    mouseDownPosition.current = { x: e.clientX, y: e.clientY }
    isDragging.current = false
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (mouseDownPosition.current) {
      const deltaX = Math.abs(e.clientX - mouseDownPosition.current.x)
      const deltaY = Math.abs(e.clientY - mouseDownPosition.current.y)
      // Se moveu mais de 5 pixels, considera como drag
      if (deltaX > 5 || deltaY > 5) {
        isDragging.current = true
      }
    }
  }, [])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    console.log('🖱️ Map - onMouseUp triggered', {
      button: e.button,
      buttons: e.buttons,
      type: e.type,
    })

    isDragging.current = false
    mouseDownPosition.current = null
  }, [])

  const handleLeftClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()

      // Se estava arrastando, não processar como clique
      if (isDragging.current) {
        console.log('🖱️ Map - Left click ignored (was dragging)')
        isDragging.current = false
        mouseDownPosition.current = null
        return
      }

      // Seleção MÚLTIPLA de radares com botão esquerdo (para input)
      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })

      console.log('🖱️ Map - Left click detected', {
        x,
        y,
        layerId: info?.layer?.id,
        objectType: info?.object ? typeof info.object : 'none',
        radarCode:
          info?.layer?.id === 'radars' && info.object
            ? (info.object as Radar).cetRioCode
            : 'none',
      })

      if (info?.layer?.id === 'radars' && info.object) {
        const radar = info.object as Radar
        console.log('🖱️ Map - Left click on radar, calling multiSelectRadar', {
          radarCode: radar.cetRioCode,
        })
        multiSelectRadar(radar)
      }

      if (info?.layer?.id === 'cameras' && info.object) {
        const camera = info.object as CameraCOR
        selectCamera(camera)
        setSelectedRadar(null)
        // Zoom automático para a câmera selecionada
        setViewport({
          latitude: camera.latitude,
          longitude: camera.longitude,
          zoom: 18,
        })
      }

      // Reset das variáveis
      isDragging.current = false
      mouseDownPosition.current = null
    },
    [multiSelectRadar],
  )

  const handleSearchSubmit = useCallback(
    (props: SearchSubmitProps) => {
      const { address } = props
      const trimmedAddress = address.replace(/^0+/, '')

      // Buscar radar
      const radar = radars?.find((r) => {
        const trimmedCetRioCode = r.cetRioCode?.replace(/^0+/, '')
        return trimmedCetRioCode === trimmedAddress
      })

      if (radar) {
        setViewport({
          latitude: radar.latitude,
          longitude: radar.longitude,
          zoom: 20,
        })
        return
      }

      // Buscar câmera
      const camera = cameras?.find((c) => {
        const trimmedCode = c.code.replace(/^0+/, '')
        return trimmedCode === trimmedAddress
      })

      if (camera) {
        setViewport({
          latitude: camera.latitude,
          longitude: camera.longitude,
          zoom: 20,
        })
      }
    },
    [radars, cameras, setViewport],
  )

  const mapStyleValue = useMemo(() => getMapStyle(mapStyle), [mapStyle])

  const handleViewStateChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: { viewState: any }) => {
      setViewport({ ...e.viewState })
    },
    [setViewport],
  )

  const getCursor = useCallback((params: CursorParams) => {
    const { isDragging, isHovering } = params
    if (isDragging) return 'grabbing'
    if (isHovering) return 'pointer'
    return 'grab'
  }, [])

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onContextMenu={handleRightClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleLeftClick}
    >
      <DeckGL
        ref={deckRef}
        initialViewState={viewport}
        controller
        onResize={() => mapRef.current?.resize()}
        layers={mapLayers}
        onViewStateChange={handleViewStateChange}
        getCursor={getCursor}
      >
        <MapGl
          ref={mapRef}
          mapStyle={mapStyleValue}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>

      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox
          isVisible={isAddressVisible}
          setIsVisible={setIsAddressVisible}
          setAddressMarker={setAddressMarker}
          setViewport={setViewport}
          onSubmit={handleSearchSubmit}
        />
      </div>

      <SelectionCards />
      <HoverCards />
      <MapLayerControl />

      <ContextMenu
        open={openContextMenu}
        onOpenChange={setOpenContextMenu}
        pickingInfo={contextMenuPickingInfo}
      />
    </div>
  )
}
