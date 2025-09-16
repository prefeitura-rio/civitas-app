import { useCallback, useEffect, useState } from 'react'

interface MapSize {
  width: number
  height: number
}

export function useMapSize(): MapSize {
  const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 })

  const updateMapSize = useCallback(() => {
    const mapMonitor = document.querySelector('.map-size-monitor')
    if (mapMonitor) {
      const rect = mapMonitor.getBoundingClientRect()
      setMapSize({ width: rect.width, height: rect.height })
    }
  }, [])

  const checkForMonitor = useCallback((resizeObserver: ResizeObserver) => {
    const mapMonitor = document.querySelector('.map-size-monitor')
    if (mapMonitor) {
      resizeObserver.observe(mapMonitor)
      updateMapSize()
      return true
    }
    return false
  }, [])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateMapSize)

    if (!checkForMonitor(resizeObserver)) {
      const retryInterval = setInterval(() => {
        if (checkForMonitor(resizeObserver)) {
          clearInterval(retryInterval)
        }
      }, 100)

      return () => {
        clearInterval(retryInterval)
        resizeObserver.disconnect()
      }
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return mapSize
}
