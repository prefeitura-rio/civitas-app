'use client'
import { createContext, type ReactNode, useContext, useState } from 'react'

interface TimelineStreamingContextProps {
  isStreamingEnabled: boolean
  setIsStreamingEnabled: (enabled: boolean) => void
}

export const TimelineStreamingContext = createContext(
  {} as TimelineStreamingContextProps,
)

interface TimelineStreamingContextProviderProps {
  children: ReactNode
}

export function TimelineStreamingContextProvider({
  children,
}: TimelineStreamingContextProviderProps) {
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(false)

  return (
    <TimelineStreamingContext.Provider
      value={{
        isStreamingEnabled,
        setIsStreamingEnabled,
      }}
    >
      {children}
    </TimelineStreamingContext.Provider>
  )
}

export function useTimelineStreaming() {
  const context = useContext(TimelineStreamingContext)
  if (!context || typeof context.setIsStreamingEnabled !== 'function') {
    throw new Error(
      'useTimelineStreaming must be used within TimelineStreamingContextProvider',
    )
  }
  return context
}
