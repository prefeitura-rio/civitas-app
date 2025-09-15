'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useViewportStore } from '@/stores/viewport-store'

export function MapSizeMonitor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setMapSize, setViewportSize } = useViewportStore()

  const updateSizes = useCallback(() => {
    setViewportSize(window.innerWidth, window.innerHeight)

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMapSize(rect.width, rect.height)
    }
  }, [setMapSize, setViewportSize])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateSizes)

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', updateSizes)

    updateSizes()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateSizes)
    }
  }, [setMapSize, setViewportSize])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
