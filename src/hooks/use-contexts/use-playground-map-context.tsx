import { useContext } from 'react'

import { PlaygroundMapContext } from '@/contexts/playground-map-context'

export function usePlaygroundMap() {
  const playgroundMapContext = useContext(PlaygroundMapContext)
  return playgroundMapContext
}
