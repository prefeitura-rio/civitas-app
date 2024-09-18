// context/MapContext.js
import { Deck } from '@deck.gl/core'
import { ScatterplotLayer } from '@deck.gl/layers'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react'

import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface PlaygroundMapContext {
  deck: Deck<null> | null
  setDeck: Dispatch<SetStateAction<Deck<null> | null>>
}

export const PlaygroundMapContext = createContext({} as PlaygroundMapContext)

interface PlaygroundMapContextProviderProps {
  children: ReactNode
}

export const PlaygroundMapContextProvider = ({
  children,
}: PlaygroundMapContextProviderProps) => {
  // const [map, setMap] = useState(null) // Reference to Mapbox instance
  const [deck, setDeck] = useState<Deck<null> | null>(null) // Reference to Deck.gl instance
  // const [viewport, setViewport] = useState({}) // Viewport state
  // const [layers, setLayers] = useState([]) // Store layers that are enabled/disabled
  // const [hoveredObject, setHoveredObject] = useState<null>(null) // Hovered object

  useEffect(() => {
    const deck = new Deck({
      initialViewState: INITIAL_VIEW_PORT,
      controller: true,
      layers: [
        new ScatterplotLayer({
          data: [
            { position: [-122.45, 37.8], color: [255, 0, 0], radius: 100 },
          ],
          getPosition: (d) => d.position,
          getFillColor: (d) => d.color,
          getRadius: (d) => d.radius,
        }),
      ],
    })

    setDeck(deck)
  }, [])

  return (
    <PlaygroundMapContext.Provider value={{ deck, setDeck }}>
      {children}
    </PlaygroundMapContext.Provider>
  )
}
