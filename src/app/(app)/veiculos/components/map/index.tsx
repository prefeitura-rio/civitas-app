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
    multipleSelectedRadars,
    setMultipleSelectedRadars,
    isMultiSelectMode,
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
      e.preventDefault()
      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })

      // Seleção de radares e câmeras com botão direito
      if (info?.layer?.id === 'radars' && info.object) {
        const radar = info.object as Radar
        selectRadar(radar)
        setSelectedCamera(null)
        // Zoom automático para o radar selecionado
        setViewport({
          latitude: radar.latitude,
          longitude: radar.longitude,
          zoom: 18,
        })
        return
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
      setViewport,
    ],
  )

  const handleMouseDown = useCallback((e: MouseEvent) => {
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

  const handleLeftClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()

      // Se estava arrastando, não processar como clique
      if (isDragging.current) {
        isDragging.current = false
        mouseDownPosition.current = null
        return
      }

      // Se estiver no modo de seleção múltipla, permitir seleção de radares com botão esquerdo
      if (isMultiSelectMode) {
        const y = e.clientY
        const x = e.clientX - 56
        const info = deckRef.current?.pickObject({ x, y, radius: 0 })

        if (info?.layer?.id === 'radars' && info.object) {
          const radar = info.object as Radar
          const radarId = radar.cetRioCode

          // Adicionar ou remover radar da seleção múltipla
          const updatedRadars = multipleSelectedRadars.includes(radarId)
            ? multipleSelectedRadars.filter((id) => id !== radarId) // Remove se já está selecionado
            : [...multipleSelectedRadars, radarId] // Adiciona se não está selecionado

          setMultipleSelectedRadars(updatedRadars)
        }
      }

      // Reset das variáveis
      isDragging.current = false
      mouseDownPosition.current = null
    },
    [isMultiSelectMode, multipleSelectedRadars, setMultipleSelectedRadars],
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
