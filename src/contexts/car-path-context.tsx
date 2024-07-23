import { FlyToInterpolator, type MapViewState } from '@deck.gl/core'
import type { DeckGLRef } from '@deck.gl/react'
import { useQuery } from '@tanstack/react-query'
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

import {
  getCarHint as getCarHintApi,
  type GetCarHintRequest,
} from '@/http/cars/hint/get-cars-hint'
import {
  getCarPath as getCarPathApi,
  GetCarPathRequest,
} from '@/http/cars/path/get-car-path'
import { getRadars } from '@/http/radars/get-radars'
import type { Radar } from '@/models/entities'
import { formatCarPathResponse, type Trip } from '@/utils/formatCarPathResponse'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface CarPathContextProps {
  trips: Trip[] | null
  selectedTrip: Trip | null
  getCarPath: (props: GetCarPathRequest) => Promise<Trip[]>
  selectedTripIndex: number
  setSelectedTripIndex: (index: number) => void
  viewport: MapViewState
  setViewport: (viewport: MapViewState) => void
  isLoading: boolean
  lastSearchParams: GetCarPathRequest | null
  deckRef: RefObject<DeckGLRef>
  mapRef: RefObject<MapRef>
  addressMarkerPosition: [longitude: number, latitude: number]
  setAddressmMarkerPositionState: Dispatch<
    SetStateAction<[longitude: number, latitude: number]>
  >
  getCarHint: (props: GetCarHintRequest) => Promise<string[]>
  possiblePlates: string[] | null
  radars: Radar[]
  selectedRadar: Radar | null
  setSelectedRadar: Dispatch<SetStateAction<Radar | null>>
  clearSearch: () => void
}

export const CarPathContext = createContext({} as CarPathContextProps)

interface CarPathContextProviderProps {
  children: ReactNode
}

export function CarPathContextProvider({
  children,
}: CarPathContextProviderProps) {
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [selectedTripIndex, setSelectedTripIndexState] = useState(0)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSearchParams, setLastSearchParams] =
    useState<GetCarPathRequest | null>(null)
  const [addressMarkerPosition, setAddressmMarkerPositionState] = useState<
    [longitude: number, latitude: number]
  >([0, 0])

  const [radars, setRadars] = useState<Radar[]>([])
  const [selectedRadar, setSelectedRadar] = useState<Radar | null>(null)

  const [possiblePlates, setPossiblePlates] = useState<string[] | null>(null)

  const deckRef = useRef<DeckGLRef>(null)
  const mapRef = useRef<MapRef>(null)

  useQuery({
    queryKey: ['radars'],
    queryFn: async () => {
      const response = await getRadars()
      setRadars(response.data)
      return response.data
    },
  })

  function setSelectedTripIndex(index: number) {
    setSelectedTripIndexState(index)
    if (trips) {
      setSelectedTrip(trips?.at(index) || null)
    }
  }

  function clearSearch() {
    setPossiblePlates(null)
    setTrips(null)
    setSelectedTrip(null)
  }

  function setViewport(newViewport: MapViewState) {
    setViewportState({
      ...viewport,
      ...newViewport,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
    // setViewportState(newViewport)
  }

  async function getCarPath({ placa, startTime, endTime }: GetCarPathRequest) {
    setIsLoading(true)
    setPossiblePlates(null)
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

  async function getCarHint(props: GetCarHintRequest) {
    setIsLoading(true)
    setTrips(null)
    setLastSearchParams({
      placa: props.plate,
      startTime: props.startTime,
      endTime: props.endTime,
    })
    const response = await getCarHintApi(props)
    setPossiblePlates(response.data)
    setIsLoading(false)

    return response.data
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
        deckRef,
        mapRef,
        addressMarkerPosition,
        setAddressmMarkerPositionState,
        getCarHint,
        possiblePlates,
        radars,
        selectedRadar,
        setSelectedRadar,
        clearSearch,
      }}
    >
      {children}
    </CarPathContext.Provider>
  )
}
