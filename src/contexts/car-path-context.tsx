import { FlyToInterpolator, type MapViewState } from '@deck.gl/core'
import type { DeckGLRef } from '@deck.gl/react'
import { useQuery } from '@tanstack/react-query'
import type { Feature } from 'geojson'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useRef,
  useState,
} from 'react'
import type { MapRef } from 'react-map-gl'

import { getCamerasCor } from '@/http/cameras-cor/get-cameras-cor'
import {
  getCarPath as getCarPathApi,
  GetCarPathRequest,
} from '@/http/cars/path/get-car-path'
import type { CameraCor } from '@/models/entities'
import { formatCarPathResponse, type Trip } from '@/utils/formatCarPathResponse'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface SelectedCamera
  extends Pick<CameraCor, 'code' | 'location' | 'streamingUrl' | 'zone'> {
  index: number
}

interface CarPathContextProps {
  trips: Trip[] | undefined
  selectedTrip: Trip | undefined
  getCarPath: (props: GetCarPathRequest) => Promise<Trip[]>
  selectedTripIndex: number
  setSelectedTripIndex: (index: number) => void
  viewport: MapViewState
  setViewport: (viewport: MapViewState) => void
  isLoading: boolean
  lastSearchParams: GetCarPathRequest | undefined
  cameras: CameraCor[]
  hightlightedObject: Feature | null
  setHightlightedObject: Dispatch<SetStateAction<Feature | null>>
  selectedCamera: SelectedCamera | null
  setSelectedCamera: Dispatch<SetStateAction<SelectedCamera | null>>
  deckRef: RefObject<DeckGLRef>
  mapRef: RefObject<MapRef>
}

export const CarPathContext = createContext({} as CarPathContextProps)

interface CarPathContextProviderProps {
  children: ReactNode
}

export function CarPathContextProvider({
  children,
}: CarPathContextProviderProps) {
  const [trips, setTrips] = useState<Trip[]>()
  const [selectedTripIndex, setSelectedTripIndexState] = useState(0)
  const [selectedTrip, setSelectedTrip] = useState<Trip>()
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSearchParams, setLastSearchParams] = useState<GetCarPathRequest>()

  const [cameras, setCameras] = useState<CameraCor[]>([])
  const [hightlightedObject, setHightlightedObject] = useState<Feature | null>(
    null,
  )
  const [selectedCamera, setSelectedCamera] = useState<SelectedCamera | null>(
    null,
  )

  const deckRef = useRef<DeckGLRef>(null)
  const mapRef = useRef<MapRef>(null)

  useQuery({
    queryKey: ['agent/locations'],
    queryFn: async () => {
      const response = await getCamerasCor()
      setCameras(response.data)
      return response.data
    },
  })

  function setSelectedTripIndex(index: number) {
    setSelectedTripIndexState(index)
    if (trips) {
      setSelectedTrip(trips?.at(index))
    }
  }

  function setViewport(newViewport: MapViewState) {
    setViewportState({
      ...newViewport,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
    // setViewportState(newViewport)
  }

  async function getCarPath({ placa, startTime, endTime }: GetCarPathRequest) {
    setIsLoading(true)
    setLastSearchParams({
      placa,
      startTime,
      endTime,
    })
    const response = await getCarPathApi({
      placa,
      startTime,
      endTime,
    })
    setIsLoading(false)

    const formattedTrips = formatCarPathResponse(response.data)
    setTrips(formattedTrips)
    setSelectedTrip(formattedTrips[0])
    setSelectedTripIndexState(0)
    setViewport({
      ...viewport,
      longitude:
        formattedTrips.at(0)?.points.at(0)?.from[0] || viewport.longitude,
      latitude:
        formattedTrips.at(0)?.points.at(0)?.from[1] || viewport.latitude,
    })
    return formattedTrips
  }

  return (
    <CarPathContext.Provider
      value={{
        trips,
        selectedTrip,
        getCarPath,
        selectedTripIndex,
        setSelectedTripIndex,
        viewport,
        setViewport,
        isLoading,
        lastSearchParams,
        cameras,
        hightlightedObject,
        setHightlightedObject,
        selectedCamera,
        setSelectedCamera,
        deckRef,
        mapRef,
      }}
    >
      {children}
    </CarPathContext.Provider>
  )
}
